
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface QuantityControlsProps {
  item: InventoryItem;
  onQuantityUpdate: (updatedItem: InventoryItem) => void;
}

export const QuantityControls = ({ item, onQuantityUpdate }: QuantityControlsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setIsUpdating(true);
    try {
      const updatedItem = await inventoryService.updateItemQuantity(item._id, newQuantity);
      onQuantityUpdate(updatedItem);
      toast({
        title: "Quantità aggiornata",
        description: `${item.name}: ${newQuantity} pezzi`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la quantità",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateQuantity(item.quantity - 1)}
        disabled={isUpdating || item.quantity <= 0 || item.used >= item.quantity}
        className="h-8 w-8 p-0"
      >
        <Minus className="w-3 h-3" />
      </Button>
      <span className="text-sm font-medium min-w-[2rem] text-center">
        {item.quantity}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateQuantity(item.quantity + 1)}
        disabled={isUpdating}
        className="h-8 w-8 p-0"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
};
