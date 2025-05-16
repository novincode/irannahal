'use client'
import React, { useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@shadcn/command";
import { Button } from "@shadcn/button";
import { Dialog } from "@shadcn/dialog";
import { Search, ChevronRight, Store, FileText, Settings, Users, Home } from "lucide-react";
import { cn } from "@ui/lib/utils";

const CommandSearch = () => {
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (value: string) => {
    // Handle selection
    console.log(value);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-full justify-between px-4 text-sm text-muted-foreground "
        onClick={() => setOpen(true)}
        dir="rtl"
      >
        <div className="inline-flex items-center">
          <Search className="ml-2 h-4 w-4" />
          <span>جستجو...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="جستجو..." dir="rtl" />
        <CommandList >
          <CommandEmpty>نتیجه‌ای یافت نشد.</CommandEmpty>
          
          <CommandGroup heading="پیشنهادات">
            <CommandItem onSelect={() => handleSelect("home")} className="flex flex-row-reverse justify-between">
              <div className="flex items-center">
                <Home className="ml-2 h-4 w-4" />
                <span>صفحه اصلی</span>
              </div>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            
            <CommandItem onSelect={() => handleSelect("products")} className="flex flex-row-reverse justify-between">
              <div className="flex items-center">
                <Store className="ml-2 h-4 w-4" />
                <span>محصولات</span>
              </div>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            
            <CommandItem onSelect={() => handleSelect("users")} className="flex flex-row-reverse justify-between">
              <div className="flex items-center">
                <Users className="ml-2 h-4 w-4" />
                <span>کاربران</span>
              </div>
              <CommandShortcut>⌘U</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="تنظیمات">
            <CommandItem onSelect={() => handleSelect("settings")} className="flex flex-row-reverse justify-between">
              <div className="flex items-center">
                <Settings className="ml-2 h-4 w-4" />
                <span>تنظیمات سیستم</span>
              </div>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            
            <CommandItem onSelect={() => handleSelect("docs")} className="flex flex-row-reverse justify-between">
              <div className="flex items-center">
                <FileText className="ml-2 h-4 w-4" />
                <span>مستندات</span>
              </div>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default CommandSearch;