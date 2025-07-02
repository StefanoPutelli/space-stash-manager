
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from './ui/checkbox';
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
  const [qt, setQt] = useState(1); // Default quantity set to 1
  const [used, setUsed] = useState(0); // Assuming this is for used tags, not implemented in the original code
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
        quantity: qt, // Default quantity set to 1
        used: used,
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
                  className={`cursor-pointer transition-all ${selectedTagIds.includes(tag._id)
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
            <p className="text-xs text-gray-500">
              Clicca sui tag per selezionarli
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quantità *</label>
            <Input
              type="number"
              value={qt} // Default quantity is 1
              onChange={(e) => {
                const quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                setQt(quantity);
                setUsed(Math.min(used, quantity)); // Ensure used does not exceed quantity
              }}
              placeholder="Quantità totale"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quantità Usata</label>
            <Input
              type="number"
              value={used}
              onChange={(e) => {
                const usedQuantity = Math.max(0, parseInt(e.target.value, 10) || 0);
                setUsed(usedQuantity);
                setQt(Math.max(qt, usedQuantity)); // Ensure quantity is at least as much as used
              }}
              placeholder="Quantità usata"
            />
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
