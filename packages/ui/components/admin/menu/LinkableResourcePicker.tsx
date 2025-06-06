"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import { Checkbox } from "@ui/components/ui/checkbox";
import { Badge } from "@ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ui/components/ui/dialog";
import { Search, X, ExternalLink, FileText, Package, Tag, Folder } from "lucide-react";
import { getProducts } from "@actions/products/get";
import { getCategories } from "@actions/categories/get";
import { getTags } from "@actions/tags/get";

interface LinkableResource {
  id: string;
  title: string;
  url: string;
  type: 'page' | 'category' | 'product' | 'tag';
  description?: string;
  slug?: string;
}

interface LinkableResourcePickerProps {
  onSelect: (resources: Array<{
    type: string;
    id: string;
    title: string;
    url: string;
  }>) => Promise<void>;
  onCancel: () => void;
}

export function LinkableResourcePicker({ onSelect, onCancel }: LinkableResourcePickerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedResources, setSelectedResources] = useState<LinkableResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<Record<string, LinkableResource[]>>({
    page: [],
    category: [],
    product: [],
    tag: [],
  });

  // Load real data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load categories
        const categoriesData = await getCategories();
        const categoryResources = categoriesData.map(cat => ({
          id: cat.id,
          title: cat.name,
          url: `/categories/${cat.slug}`,
          type: 'category' as const,
          slug: cat.slug,
        }));

        // Load products
        const productsData = await getProducts();
        const productResources = productsData.map(product => ({
          id: product.id,
          title: product.name,
          url: `/products/${product.slug}`,
          type: 'product' as const,
          slug: product.slug,
          description: product.description || undefined,
        }));

        // Load tags
        const tagsData = await getTags();
        const tagResources = tagsData.map(tag => ({
          id: tag.id,
          title: tag.name,
          url: `/tags/${tag.slug}`,
          type: 'tag' as const,
          slug: tag.slug,
        }));

        // Mock pages data (since posts actions are empty)
        const pageResources = [
          { id: '1', title: 'درباره ما', url: '/about', type: 'page' as const, description: 'اطلاعات شرکت' },
          { id: '2', title: 'تماس با ما', url: '/contact', type: 'page' as const, description: 'با ما در ارتباط باشید' },
          { id: '3', title: 'سوالات متداول', url: '/faq', type: 'page' as const, description: 'سوالات پرتکرار' },
        ];

        setResources({
          page: pageResources,
          category: categoryResources,
          product: productResources,
          tag: tagResources,
        });
      } catch (error) {
        console.error('Failed to load linkable resources:', error);
        // Fallback to mock data
        const mockData: Record<string, LinkableResource[]> = {
          page: [
            { id: '1', title: 'درباره ما', url: '/about', type: 'page', description: 'اطلاعات شرکت' },
            { id: '2', title: 'تماس با ما', url: '/contact', type: 'page', description: 'با ما در ارتباط باشید' },
            { id: '3', title: 'سوالات متداول', url: '/faq', type: 'page', description: 'سوالات پرتکرار' },
          ],
          category: [
            { id: '4', title: 'الکترونیک', url: '/categories/electronics', type: 'category', slug: 'electronics' },
            { id: '5', title: 'پوشاک', url: '/categories/clothing', type: 'category', slug: 'clothing' },
            { id: '6', title: 'کتاب', url: '/categories/books', type: 'category', slug: 'books' },
          ],
          product: [
            { id: '7', title: 'آیفون ۱۵ پرو', url: '/products/iphone-15-pro', type: 'product', slug: 'iphone-15-pro' },
            { id: '8', title: 'مک‌بوک ایر M3', url: '/products/macbook-air-m3', type: 'product', slug: 'macbook-air-m3' },
            { id: '9', title: 'ایرپادز پرو', url: '/products/airpods-pro', type: 'product', slug: 'airpods-pro' },
          ],
          tag: [
            { id: '10', title: 'ویژه', url: '/tags/featured', type: 'tag', slug: 'featured' },
            { id: '11', title: 'جدید', url: '/tags/new-arrival', type: 'tag', slug: 'new-arrival' },
            { id: '12', title: 'حراج', url: '/tags/sale', type: 'tag', slug: 'sale' },
          ],
        };
        setResources(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onCancel, 150);
  };

  const handleResourceToggle = (resource: LinkableResource) => {
    setSelectedResources(prev => {
      const exists = prev.find(r => r.id === resource.id);
      if (exists) {
        return prev.filter(r => r.id !== resource.id);
      } else {
        return [...prev, resource];
      }
    });
  };

  const handleSelectAll = (type: string) => {
    const typeResources = getFilteredResources(type);
    const allSelected = typeResources.every(resource => 
      selectedResources.some(selected => selected.id === resource.id)
    );

    if (allSelected) {
      // Deselect all of this type
      setSelectedResources(prev => 
        prev.filter(selected => selected.type !== type)
      );
    } else {
      // Select all of this type
      setSelectedResources(prev => {
        const withoutType = prev.filter(selected => selected.type !== type);
        return [...withoutType, ...typeResources];
      });
    }
  };

  const getFilteredResources = (type: string) => {
    const typeResources = resources[type] || [];
    if (!searchQuery.trim()) return typeResources;
    
    return typeResources.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleAddSelected = async () => {
    if (selectedResources.length === 0) return;
    
    setIsLoading(true);
    try {
      await onSelect(selectedResources.map(resource => ({
        type: resource.type,
        id: resource.id,
        title: resource.title,
        url: resource.url,
      })));
      handleClose();
    } catch (error) {
      console.error('Failed to add selected resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="h-4 w-4" />;
      case 'category': return <Folder className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'tag': return <Tag className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-green-100 text-green-800';
      case 'product': return 'bg-purple-100 text-purple-800';
      case 'tag': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmptyStateMessage = (type: string) => {
    switch (type) {
      case 'page': return 'صفحه‌ای موجود نیست';
      case 'category': return 'دسته‌بندی‌ای موجود نیست';
      case 'product': return 'محصولی موجود نیست';
      case 'tag': return 'برچسبی موجود نیست';
      default: return 'موردی موجود نیست';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            افزودن محتوا به منو
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی محتوا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Summary */}
          {selectedResources.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedResources.length} مورد انتخاب شده
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedResources([])}
                >
                  پاک کردن انتخاب
                </Button>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <Tabs defaultValue="page" className="h-[400px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="page" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                صفحات
              </TabsTrigger>
              <TabsTrigger value="category" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                دسته‌بندی‌ها
              </TabsTrigger>
              <TabsTrigger value="product" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                محصولات
              </TabsTrigger>
              <TabsTrigger value="tag" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                برچسب‌ها
              </TabsTrigger>
            </TabsList>

            {Object.keys(resources).map(type => (
              <TabsContent key={type} value={type} className="h-full overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Select All */}
                  <div className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={getFilteredResources(type).length > 0 && getFilteredResources(type).every(resource => 
                          selectedResources.some(selected => selected.id === resource.id)
                        )}
                        onCheckedChange={() => handleSelectAll(type)}
                      />
                      <Label className="text-sm font-medium">
                        انتخاب همه ({getFilteredResources(type).length})
                      </Label>
                    </div>
                  </div>

                  {/* Resource List */}
                  <div className="flex-1 overflow-y-auto space-y-1 p-2">
                    {getFilteredResources(type).map(resource => {
                      const isSelected = selectedResources.some(r => r.id === resource.id);
                      return (
                        <div
                          key={resource.id}
                          className={`
                            flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                            ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}
                          `}
                          onClick={() => handleResourceToggle(resource)}
                        >
                          <Checkbox checked={isSelected} onChange={() => {}} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(resource.type)}
                              <span className="font-medium text-sm truncate">
                                {resource.title}
                              </span>
                              <Badge variant="secondary" className={`text-xs ${getTypeColor(resource.type)}`}>
                                {resource.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {resource.url}
                            </div>
                            {resource.description && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {resource.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {getFilteredResources(type).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="mb-2">{getTypeIcon(type)}</div>
                        <p className="text-sm">
                          {searchQuery ? 'موردی یافت نشد' : getEmptyStateMessage(type)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            لغو
          </Button>
          <Button 
            onClick={handleAddSelected} 
            disabled={selectedResources.length === 0 || isLoading}
          >
            {isLoading ? 'در حال افزودن...' : `افزودن ${selectedResources.length} مورد`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
