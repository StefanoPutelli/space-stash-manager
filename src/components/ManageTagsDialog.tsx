import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tag as TagIcon, Plus, Trash2 } from 'lucide-react';
import { Tag } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface ManageTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onTagCreated: (tag: Tag) => void;
  onTagDeleted: (tagId: string) => void;
}

export const ManageTagsDialog = ({ 
  open, 
  onOpenChange, 
  tags, 
  onTagCreated, 
  onTagDeleted 
}: ManageTagsDialogProps) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');
  const [isLoading, setIsLoading] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeletingTag, setIsDeletingTag] = useState(false);
  
  const { toast } = useToast();

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del tag è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    if (tags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      toast({
        title: "Errore",
        description: "Un tag con questo nome esiste già",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newTag = await inventoryService.createTag(newTagName.trim(), newTagColor.trim());
      onTagCreated(newTag);
      setNewTagName('');
      setNewTagColor('#000000');
      
      toast({
        title: "Tag creato",
        description: `Il tag "${newTag.name}" è stato aggiunto`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare il tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    setIsDeletingTag(true);
    
    try {
      await inventoryService.deleteTag(tagToDelete._id);
      onTagDeleted(tagToDelete._id);
      setTagToDelete(null);
      
      toast({
        title: "Tag eliminato",
        description: `Il tag "${tagToDelete.name}" è stato eliminato`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il tag",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTag(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Gestisci Tag
            </DialogTitle>
            <DialogDescription>
              Visualizza, crea ed elimina tag per organizzare l'inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Tag */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Crea Nuovo Tag</h4>
              <form onSubmit={handleCreateTag} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nome del tag..."
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-10 p-0 border rounded"
                    title="Seleziona colore"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Existing Tags */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Tag Esistenti ({tags.length})</h4>
              <div className="p-3 border rounded-md bg-gray-50 min-h-[100px] max-h-[200px] overflow-y-auto">
                {tags.map(tag => (
                  <div key={tag._id} className="flex items-center justify-between mb-2 p-2 bg-white rounded border">
                    <Badge
                      variant="outline"
                      style={{ backgroundColor: tag.color }}
                      className="text-white"
                    >
                      {tag.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTagToDelete(tag)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <p className="text-gray-500 text-sm">Nessun tag disponibile</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il tag <strong>"{tagToDelete?.name}"</strong>?
              <br />
              Questa azione non può essere annullata e rimuoverà il tag da tutti gli oggetti associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTag}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTag}
              disabled={isDeletingTag}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingTag ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
