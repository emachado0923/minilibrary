'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Home, Library, BookOpen, Bot, Sparkles, Settings, LogOut,
  ChevronLeft, ChevronRight, BarChart3, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/books', label: 'Catalog', icon: Library },
  { href: '/my-loans', label: 'My Loans', icon: BookOpen },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
  { href: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { href: '/admin', label: 'Admin Panel', icon: BarChart3 },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen border-r bg-card flex flex-col
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setMobileOpen(false)}>
            <Library className="h-6 w-6 text-primary shrink-0" />
            <span>LibraryOS</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto" onClick={() => setMobileOpen(false)}>
            <Library className="h-6 w-6 text-primary" />
          </Link>
        )}

        {/* Desktop collapse button */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-1 shrink-0">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-8 hidden lg:flex"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <Link
          href="/login"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  )
}
