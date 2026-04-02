'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/layout/sidebar'
import { useState } from 'react'
import { Menu, Library } from 'lucide-react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoginPage) {
    return <SessionProvider>{children}</SessionProvider>
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main
          className={`min-h-screen transition-all duration-300 ${
            collapsed ? 'lg:pl-16' : 'lg:pl-64'
          }`}
        >
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center h-14 px-4 border-b bg-card sticky top-0 z-20">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-3 flex items-center gap-2 font-bold text-lg">
              <Library className="h-5 w-5 text-primary" />
              LibraryOS
            </div>
          </div>

          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  )
}
