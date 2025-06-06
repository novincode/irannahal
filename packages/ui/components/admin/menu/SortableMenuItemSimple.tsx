"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@ui/components/ui/button";
import { Badge } from "@ui/components/ui/badge";
import { GripVertical, Edit, Trash2, EyeOff, ExternalLink, ChevronRight } from "lucide-react";
import type { MenuItemWithChildren } from "@actions/menu";

interface SortableMenuItemProps {
  item: MenuItemWithChildren;
  onEdit: (item: MenuItemWithChildren) => void;
  onDelete: (itemId: string) => void;
  isLoading?: boolean;
  depth?: number;
}

export function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete, 
  isLoading = false,
  depth = 0,
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: item.id,
    data: {
      item: item,
      depth: depth,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = item.children && item.children.length > 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-green-100 text-green-800';
      case 'product': return 'bg-purple-100 text-purple-800';
      case 'tag': return 'bg-yellow-100 text-yellow-800';
      case 'external': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    if (!isLoading) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    if (!isLoading && confirm('آیا مطمئن هستید که می‌خواهید این آیتم منو را حذف کنید؟ این عمل قابل بازگشت نیست.')) {
      onDelete(item.id);
    }
  };

  return (
    <div className="mb-1">
      {/* Main Item */}
      <div
        ref={setNodeRef}
        style={style}
        className={`
          relative flex items-center gap-3 p-3 bg-background border rounded-lg transition-all
          ${isDragging ? 'opacity-50 shadow-lg z-50 scale-105' : 'hover:bg-muted/50'}
          ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
          ${depth > 0 ? 'ml-8' : ''}
        `}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Hierarchy indicator */}
        {depth > 0 && (
          <div className="text-muted-foreground">
            <ChevronRight className="h-3 w-3" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{item.label}</span>
            <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
              {item.type}
            </Badge>
            {item.target === '_blank' && (
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            )}
            {!item.isVisible && (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          {item.url && (
            <div className="text-xs text-muted-foreground truncate">
              {item.url}
            </div>
          )}
          {item.cssClasses && (
            <div className="text-xs text-muted-foreground mt-1">
              کلاس‌ها: {item.cssClasses}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children - Rendered recursively with increased depth */}
      {hasChildren && (
        <div className="mt-1">
          {item.children.map((child) => (
            <SortableMenuItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
