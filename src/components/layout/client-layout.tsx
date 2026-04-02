'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/layout/sidebar'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <SessionProvider>{children}</SessionProvider>
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64 min-h-screen transition-all duration-300">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  )
}
