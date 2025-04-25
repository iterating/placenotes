import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Manages selection state for a list of items.
 * Assumes items have a unique 'id' or '_id' property.
 *
 * @param {Array<Object>} items - The list of items to manage selection for.
 * @returns {{ 
 *   selectedItems: Set<string>, 
 *   handleSelectItem: (itemId: string) => void, 
 *   toggleSelectAll: () => void, 
 *   isAllSelected: boolean, 
 *   clearSelection: () => void 
 * }}
 */
export const useSelectionState = (items = []) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const itemIds = useMemo(() => new Set(items.map(item => item._id || item.id).filter(Boolean)), [items]);
  const totalItems = itemIds.size;

  // Clear selection if the underlying items list changes significantly
  useEffect(() => {
    setSelectedItems(currentSelected => {
      const newSelected = new Set();
      for (const id of currentSelected) {
        if (itemIds.has(id)) {
          newSelected.add(id);
        }
      }
      // Only update state if the selection actually changed
      return newSelected.size === currentSelected.size ? currentSelected : newSelected;
    });
  }, [itemIds]); // Depend on the derived set of item IDs

  const handleSelectItem = useCallback((itemId) => {
    setSelectedItems(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  }, []);

  const isAllSelected = useMemo(() => totalItems > 0 && selectedItems.size === totalItems, [
    selectedItems.size,
    totalItems
  ]);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set()); // Deselect all
    } else {
      setSelectedItems(itemIds); // Select all
    }
  }, [isAllSelected, itemIds]);
  
  const clearSelection = useCallback(() => {
      setSelectedItems(new Set());
  }, []);

  return {
    selectedItems, // The Set of selected IDs
    handleSelectItem,
    toggleSelectAll,
    isAllSelected,
    clearSelection // Function to manually clear selection
  };
};
