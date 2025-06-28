
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tag, InventoryItem } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onItemAdded: (item: InventoryItem) => void;
}

export const AddItemDialog = ({ open, onOpenChange, tags, onItemAdded }: AddItemDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome dell'oggetto è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newItem = await inventoryService.createItem({
        name: name.trim(),
        description: description.trim(),
        tagIds: selectedTagIds
      });
      
      onItemAdded(newItem);
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedTagIds([]);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'oggetto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Oggetto</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del nuovo oggetto per l'inventario
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Cavo LAN Cat6"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Descrizione</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione dettagliata dell'oggetto..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tag</label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[60px]">
              {tags.map(tag => (
                <Badge
                  key={tag._id}
                  variant="outline"
                  className={`cursor-pointer transition-all border`}
                  style={{
                    backgroundColor: selectedTagIds.includes(tag._id) ? '#3b82f6' : tag.color,
                    color: '#fff',
                  }}
                  onClick={() => toggleTag(tag._id)}
                >
                  {tag.name}
                  {selectedTagIds.includes(tag._id) && (
                    <span className="ml-1 font-bold">✓</span>
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Clicca sui tag per selezionarli
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Aggiunta..." : "Aggiungi Oggetto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
