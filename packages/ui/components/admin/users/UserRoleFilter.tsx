'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/select"
import { userRoleEnum } from "@db/schema"

interface UserRoleFilterProps {
  value?: string
  onChange: (value: string) => void
}

const roleLabels: Record<string, string> = {
  admin: "مدیر",
  user: "کاربر",
  author: "نویسنده",
  customer: "مشتری",
}

export function UserRoleFilter({ value = "all", onChange }: UserRoleFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="همه نقش‌ها" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">همه نقش‌ها</SelectItem>
        {userRoleEnum.enumValues.map((role) => (
          <SelectItem key={role} value={role}>
            {roleLabels[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
