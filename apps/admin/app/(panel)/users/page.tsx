import { getUsers } from "@actions/users/getUsers"
import { UserRoleFilter } from "@packages/ui/components/admin/users/UserRoleFilter"
import { UsersDataTable } from "@packages/ui/components/admin/users/UsersDataTable"
import { Card } from "@shadcn/card"

interface UsersPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.pageSize) || 20
  const search = searchParams.search?.toString() || ""
  const role = searchParams.role?.toString()
  const status = searchParams.status?.toString()

  const { users, total, totalPages } = await getUsers({
    page,
    pageSize,
    search,
    role,
    status,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">کاربران</h1>
        <p className="text-muted-foreground mt-2">
          مدیریت و مشاهده کاربران سیستم
        </p>
      </div>

      <Card className="p-6">
        <UsersDataTable 
          data={users} 
          pageCount={totalPages}
          initialSearch={search}
          initialRole={role}
          initialStatus={status}
        />
      </Card>
    </div>
  )
}
