
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { InventoryItem, Tag, UpdateItemData } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  tags: Tag[];
  onItemUpdated: (updatedItem: InventoryItem) => void;
}

export const EditItemDialog = ({
  open,
  onOpenChange,
  item,
  tags,
  onItemUpdated,
}: EditItemDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    selectedTagIds: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        selectedTagIds: item.tags.map(tag => tag._id),
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsLoading(true);
    try {
      const updateData: UpdateItemData = {
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        tagIds: formData.selectedTagIds,
      };

      const updatedItem = await inventoryService.updateItem(item._id, updateData);
      onItemUpdated(updatedItem);
      onOpenChange(false);
      toast({
        title: "Oggetto aggiornato",
        description: `${updatedItem.name} è stato modificato con successo`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'oggetto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTagIds: prev.selectedTagIds.includes(tagId)
        ? prev.selectedTagIds.filter(id => id !== tagId)
        : [...prev.selectedTagIds, tagId]
    }));
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Oggetto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="quantity">Quantità</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              required
            />
          </div> */}

          <div className="space-y-2">
            <Label>Tag</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag._id}
                  variant="outline"
                  className={`cursor-pointer transition-all ${
                    formData.selectedTagIds.includes(tag._id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleTag(tag._id)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
