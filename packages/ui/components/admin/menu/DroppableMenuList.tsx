"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableMenuItem } from "./SortableMenuItem";
import type { MenuItemWithChildren } from "@actions/menu";

interface DroppableMenuListProps {
  items: MenuItemWithChildren[];
  containerId: string;
  onEdit: (item: MenuItemWithChildren) => void;
  onDelete: (itemId: string) => void;
  isLoading?: boolean;
  depth?: number;
}

export function DroppableMenuList({
  items,
  containerId,
  onEdit,
  onDelete,
  isLoading = false,
  depth = 0,
}: DroppableMenuListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
  });

  const itemIds = items.map(item => item.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[4px] transition-all
        ${isOver ? 'bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg' : ''}
        ${depth > 0 ? 'ml-8 border-r-2 border-muted pl-4' : ''}
      `}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="group">
              <SortableMenuItem
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
                depth={depth}
              />
              
              {/* Nested children with their own droppable area */}
              {item.children && item.children.length > 0 && (
                <DroppableMenuList
                  items={item.children}
                  containerId={`children-${item.id}`}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isLoading={isLoading}
                  depth={depth + 1}
                />
              )}
              
              {/* Empty droppable area for adding children */}
              <DroppableMenuList
                items={[]}
                containerId={`drop-zone-${item.id}`}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
                depth={depth + 1}
              />
            </div>
          ))}
          
          {/* Empty state message */}
          {items.length === 0 && depth === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>هیچ آیتم منو یافت نشد</p>
              <p className="text-sm mt-1">برای شروع یک آیتم جدید اضافه کنید</p>
            </div>
          )}
          
          {/* Drop zone indicator for nested items */}
          {items.length === 0 && depth > 0 && isOver && (
            <div className="py-2 px-4 text-center text-sm text-muted-foreground bg-primary/5 border border-dashed border-primary/30 rounded">
              آیتم را اینجا رها کنید
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
