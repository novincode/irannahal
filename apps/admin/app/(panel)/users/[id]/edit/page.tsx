import { getUser } from "@actions/users/get"
import { notFound } from "next/navigation"
import { UserEditForm } from "@packages/ui/components/admin/users/UserEditForm"
import { UserStats } from "@packages/ui/components/admin/users/UserStats"
import { UserOrders } from "@packages/ui/components/admin/users/UserOrders"
import { Card } from "@shadcn/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shadcn/tabs"

interface UserEditPageProps {
  params: Promise<{ id: string }>
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ویرایش کاربر</h1>
        <p className="text-muted-foreground mt-2">
          {user.name || "کاربر"} - {user.email || user.phone}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">پروفایل</TabsTrigger>
          <TabsTrigger value="orders">سفارش‌ها</TabsTrigger>
          <TabsTrigger value="stats">آمار</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6">
            <UserEditForm user={user} />
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="p-6">
            <UserOrders userId={user.id} />
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <UserStats userId={user.id} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
