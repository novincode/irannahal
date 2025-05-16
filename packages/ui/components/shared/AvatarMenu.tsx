import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shadcn/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"

const AvatarMenu = () => {
    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <User className="ml-2 h-4 w-4" /> پروفایل
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="ml-2 h-4 w-4" /> تنظیمات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                    <LogOut className="ml-2 h-4 w-4" /> خروج
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AvatarMenu