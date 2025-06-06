/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { MenuItemWithChildren } from '@actions/menu';
import { NextKalaSortableMenuItem, NextKalaSortableMenuItemProps } from './NextKalaSortableMenuItem';

interface NextKalaDroppableSubMenuProps {
  id: string; // Unique ID for this droppable container (e.g., parent item ID or 'root')
  items: MenuItemWithChildren[];
  depth: number;
  renderChildren: NextKalaSortableMenuItemProps['renderChildren']; // Pass down from parent
  onEditItem: NextKalaSortableMenuItemProps['onEditItem'];
  onDeleteItem: NextKalaSortableMenuItemProps['onDeleteItem'];
  onAddChildItem: NextKalaSortableMenuItemProps['onAddChildItem'];
  maxDepth?: number;
  isLoading?: boolean;
}

export function NextKalaDroppableSubMenu({
  id,
  items,
  depth,
  renderChildren,
  onEditItem,
  onDeleteItem,
  onAddChildItem,
  maxDepth,
  isLoading,
}: NextKalaDroppableSubMenuProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: id, // This ID is crucial for dnd-kit to identify the droppable area
    data: {
      type: 'submenu-droppable-area',
      parentId: id === 'root' ? null : id,
      depth: depth,
      accepts: ['menu-item'], // Specify what it can accept
    },
  });

  const { active: dndActive } = useDndContext();
  const isPotentialDropTarget = dndActive && dndActive.data.current?.type === 'menu-item';

  // Get item IDs for this specific list/submenu for its SortableContext
  const itemIds = items.map(item => item.id);

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy} id={id}>
      <div
        ref={setNodeRef}
        className={`submenu-container transition-all duration-150 ease-in-out 
          ${depth > 0 ? 'pl-0' : ''} 
          ${isOver && isPotentialDropTarget ? 'bg-primary/5 border-2 border-dashed border-primary/30 rounded-md py-2' : 'py-0'}
          min-h-[10px] space-y-1
        `}
      >
        {items.map(item => (
          <NextKalaSortableMenuItem
            key={item.id}
            item={item}
            depth={depth}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onAddChildItem={onAddChildItem}
            renderChildren={renderChildren} // Pass the renderChildren function for recursive rendering
            maxDepth={maxDepth}
            isLoading={isLoading}
          />
        ))}
        {/* Placeholder when empty and a drag is over, to show it's a valid drop target */}
        {items.length === 0 && isOver && isPotentialDropTarget && (
          <div className="h-10 flex items-center justify-center text-sm text-muted-foreground p-2 bg-muted/30 rounded-md">
            Drop here to make it a child of {id === 'root' ? 'the menu' : 'this item'}
          </div>
        )}
      </div>
    </SortableContext>
  );
}
