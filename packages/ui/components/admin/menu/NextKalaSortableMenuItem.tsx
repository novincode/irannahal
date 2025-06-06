/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, ChevronDown, ChevronRight, Plus, EyeOff, ExternalLink } from 'lucide-react';
import { Button } from '@ui/components/ui/button';
import { Badge } from '@ui/components/ui/badge';
import type { MenuItemWithChildren } from '@actions/menu';
import { NextKalaDroppableSubMenu } from './NextKalaDroppableSubMenu'; // We'll create this next

export interface NextKalaSortableMenuItemProps {
  item: MenuItemWithChildren;
  depth: number;
  isOverlay?: boolean; // To render a simpler version in DragOverlay
  onEditItem: (item: MenuItemWithChildren) => void;
  onDeleteItem: (itemId: string) => void;
  onAddChildItem: (parentId: string) => void;
  // We'll need a way to render children, passed down from the main builder
  renderChildren: (items: MenuItemWithChildren[], parentId: string, currentDepth: number) => React.ReactNode;
  maxDepth?: number;
  isLoading?: boolean;
}

export function NextKalaSortableMenuItem({
  item,
  depth,
  isOverlay = false,
  onEditItem,
  onDeleteItem,
  onAddChildItem,
  renderChildren,
  maxDepth = 4, // Default max depth
  isLoading = false,
}: NextKalaSortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: {
      type: 'menu-item',
      item: item,
      depth: depth,
    },
  });

  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: isOverlay ? 0 : `${depth * 24}px`, // Indentation for nesting
    opacity: isDragging && !isOverlay ? 0.5 : 1,
  };

  const hasChildren = item.children && item.children.length > 0;
  const canHaveChildren = depth < maxDepth -1; // -1 because depth is 0-indexed

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag listeners from firing
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditItem(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem(item.id);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canHaveChildren) {
      onAddChildItem(item.id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'category': return 'bg-green-100 text-green-800 border-green-200';
      case 'product': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tag': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'external': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isOverlay) {
    return (
      <div
        style={style}
        className="p-3 bg-background border rounded-lg shadow-md flex items-center gap-2"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-sm truncate flex-grow">{item.label}</span>
        <Badge variant="secondary" className={`text-xs border ${getTypeColor(item.type)}`}>
          {item.type}
        </Badge>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-1 group">
      <div
        className={`flex items-center gap-2 p-2 bg-background border rounded-md hover:bg-muted/50 transition-colors group-hover:border-primary/50 ${isDragging ? 'shadow-lg border-primary' : 'border-border'}`}
      >
        {/* Drag Handle and Expander */}
        <div className="flex items-center flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()} // Allow drag without toggle, but click on icon should not toggle
            className="cursor-grab active:cursor-grabbing h-7 w-7 p-1 text-muted-foreground hover:bg-muted"
            disabled={isLoading}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleExpand}
              className="h-7 w-7 p-1 text-muted-foreground hover:bg-muted"
              disabled={isLoading}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-7 h-7 p-1"></div> // Placeholder for alignment
          )}
        </div>

        {/* Item Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{item.label}</span>
            <Badge variant="secondary" className={`text-xs border ${getTypeColor(item.type)}`}>
              {item.type}
            </Badge>
            {item.target === '_blank' && (
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            )}
            {!item.isVisible && (
              <EyeOff className="h-3 w-3 text-orange-500" />
            )}
          </div>
          {item.url && (
            <div className="text-xs text-muted-foreground truncate font-mono">
              {item.url}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {canHaveChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddChild}
              disabled={isLoading}
              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading}
            className="h-7 px-2 hover:bg-blue-50"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Render Children in a Droppable SubMenu context */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {/* This is where children will be rendered, inside their own SortableContext */}
          {/* We pass the renderChildren function down to handle recursive rendering */}
          {renderChildren(item.children!, item.id, depth + 1)}
        </div>
      )}
    </div>
  );
}
