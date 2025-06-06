import { Suspense } from "react";
import { MenuManagement } from "./MenuManagement";

export default function MenuPage() {
  return (
    <div className="container mx-auto py-6" dir="rtl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">مدیریت منوها</h1>
          <p className="text-muted-foreground">
            منوهای ناوبری وب‌سایت خود را ایجاد و مدیریت کنید
          </p>
        </div>

        <Suspense fallback={<div>در حال بارگذاری منوها...</div>}>
          <MenuManagement />
        </Suspense>
      </div>
    </div>
  );
}