'use client'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shadcn/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@shadcn/button'
import Link from 'next/link'
import { panelMenuItems } from '../panel/menu-config'

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
                <Avatar className="cursor-pointer">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel>{session.user?.name || 'کاربر'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {panelMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                            <item.icon className="ml-2 h-4 w-4" />
                            {item.title}
                        </Link>
                    </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({redirectTo: "/"})} className="text-red-600 cursor-pointer">
                    <LogOut className="ml-2 h-4 w-4" /> خروج
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AvatarMenu