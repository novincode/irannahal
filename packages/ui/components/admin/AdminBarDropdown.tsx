'use client'
import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shadcn/dropdown-menu"
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Settings } from "lucide-react"
import { Button } from '@shadcn/button'

interface AdminBarDropdownProps {
    admin_url?: string;
}

const AdminBarDropdown = ({ admin_url = "/admin" }: AdminBarDropdownProps) => {
    // Only call useSession if sessionProp is not provided
    const { data: session } = useSession()

    if (!session?.user?.id) {
        return null
    }
    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    خوش آمدید، {session.user.name}

                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem asChild>
                    <Link href={admin_url}>
                        <LayoutDashboard className="ml-2 h-4 w-4" /> داشبورد
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`${admin_url}/settings`}>
                        <Settings className="ml-2 h-4 w-4" /> تنظیمات
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ redirectTo: "/" })} className="text-red-600 cursor-pointer">
                    <LogOut className="ml-2 h-4 w-4" /> خروج
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default AdminBarDropdown