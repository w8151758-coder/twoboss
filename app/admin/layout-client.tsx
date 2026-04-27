"use client"

import { I18nProvider } from "@/lib/i18n"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

interface AdminLayoutClientProps {
  children: React.ReactNode
  profile: { role: string; name: string | null; email: string }
}

export function AdminLayoutClient({ children, profile }: AdminLayoutClientProps) {
  return (
    <I18nProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader user={profile} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  )
}
