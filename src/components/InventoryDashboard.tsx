import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Tag as TagIcon, User, Trash2, Edit } from 'lucide-react';
import { InventoryItem, Tag } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';
import { useAuth } from '@/hooks/useAuth';
import { AddItemDialog } from '@/components/AddItemDialog';
import { ManageTagsDialog } from '@/components/ManageTagsDialog';
import { DeleteItemDialog } from '@/components/DeleteItemDialog';
import { EditItemDialog } from '@/components/EditItemDialog';
import { QuantityControls } from '@/components/QuantityControls';
import { QuantityUsedControls } from './QuantityUsedControls';
import { useToast } from '@/hooks/use-toast';

export const InventoryDashboard = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [itemsData, tagsData] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getTags()
      ]);
      setItems(itemsData);
      setTags(tagsData);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati dell'inventario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await inventoryService.searchItems(searchQuery, selectedTagIds);
      setItems(results);
    } catch (error) {
      toast({
        title: "Errore di ricerca",
        description: "Impossibile completare la ricerca",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (newItem: InventoryItem) => {
    setItems(prev => [newItem, ...prev]);
    setShowAddDialog(false);
    toast({
      title: "Oggetto aggiunto",
      description: `${newItem.name} è stato aggiunto all'inventario`,
    });
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeletingItem(true);
    
    try {
      await inventoryService.deleteItem(itemToDelete._id);
      setItems(prev => prev.filter(item => item._id !== itemToDelete._id));
      setItemToDelete(null);
      
      toast({
        title: "Oggetto eliminato",
        description: `${itemToDelete.name} è stato eliminato dall'inventario`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'oggetto",
        variant: "destructive",
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleTagCreated = (newTag: Tag) => {
    setTags(prev => [...prev, newTag]);
  };

  const handleTagDeleted = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag._id !== tagId));
    // Rimuovi il tag dai filtri se selezionato
    setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    // Ricarica gli items per aggiornare quelli che avevano questo tag
    loadInitialData();
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleItemUpdated = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item._id === updatedItem._id ? updatedItem : item
    ));
  };

  const handleQuantityUpdate = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item._id === updatedItem._id ? updatedItem : item
    ));
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery && selectedTagIds.length === 0) return items;

    return items.filter(item => {
      const matchesQuery = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags = selectedTagIds.length === 0 ||
        selectedTagIds.some(tagId => item.tags.some(tag => tag._id === tagId));

      return matchesQuery && matchesTags;
    });
  }, [items, searchQuery, selectedTagIds]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">HS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventario Hackinpovo</h1>
                <p className="text-sm text-gray-500">Gestisci oggetti e componenti</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca oggetti per nome, descrizione o tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? "Ricerca..." : "Cerca"}
                </Button>
              </div>

              {/* Tag Filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Filtra per tag:</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTagsDialog(true)}
                      className="text-xs"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      Gestisci Tag
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddDialog(true)}
                      className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Aggiungi Oggetto
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    console.log(tag);
                    return <Badge
                    key={tag._id}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      selectedTagIds.includes(tag._id)
                        ? 'bg-blue-100 border-blue-300'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTagFilter(tag._id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </Badge>
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Oggetti ({filteredItems.length})</span>
              {selectedTagIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTagIds([])}
                  className="text-xs text-gray-500"
                >
                  Rimuovi filtri
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Descrizione</TableHead>
                    <TableHead className="font-semibold">Tag</TableHead>
                    <TableHead className="font-semibold w-[12%]">Quantità</TableHead>
                    <TableHead className="font-semibold w-[12%]">Utilizzato</TableHead>
                    <TableHead className="font-semibold w-[12%]">Data Aggiunta</TableHead>
                    {/* <TableHead className="font-semibold">Aggiunto da</TableHead> */}
                    <TableHead className="font-semibold w-[10%]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchQuery || selectedTagIds.length > 0
                          ? "Nessun oggetto trovato con i filtri applicati"
                          : "Nessun oggetto nell'inventario"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item._id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-gray-600">{item.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map(tag => (
                              <Badge
                              key={tag._id}
                              variant="outline"
                            >
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <QuantityControls 
                            item={item} 
                            onQuantityUpdate={handleQuantityUpdate}
                          />
                        </TableCell>
                        <TableCell>
                          <QuantityUsedControls 
                            item={item} 
                            onQuantityUpdate={handleQuantityUpdate}
                          />
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(item.dateAdded)}</TableCell>
                        {/* <TableCell className="text-gray-600">{item.addedBy}</TableCell> */}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setItemToEdit(item)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setItemToDelete(item)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        tags={tags}
        onItemAdded={handleAddItem}
      />

      <ManageTagsDialog
        open={showTagsDialog}
        onOpenChange={setShowTagsDialog}
        tags={tags}
        onTagCreated={handleTagCreated}
        onTagDeleted={handleTagDeleted}
      />

      <DeleteItemDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
        item={itemToDelete}
        onConfirm={handleDeleteItem}
        isLoading={isDeletingItem}
      />

      <EditItemDialog
        open={!!itemToEdit}
        onOpenChange={() => setItemToEdit(null)}
        item={itemToEdit}
        tags={tags}
        onItemUpdated={handleItemUpdated}
      />
    </div>
  );
};
