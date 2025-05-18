'use client'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shadcn/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@shadcn/button'
import Link from 'next/link'

const AvatarMenu = () => {
    const { data: session } = useSession()

    if (!session?.user?.id) {
        return (
            <Button variant={'primary_outline'} asChild>
                <Link href={'/auth'}>
                    ورود / ثبت نام

                </Link>
            </Button>
        )
    }

    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel>{session.user?.id}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <User className="ml-2 h-4 w-4" /> پروفایل
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="ml-2 h-4 w-4" /> تنظیمات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({redirectTo: "/"})} className="text-red-600">
                    <LogOut className="ml-2 h-4 w-4" /> خروج
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AvatarMenu