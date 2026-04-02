import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'LIBRARIAN' | 'ADMIN'
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  // 1. Custom cookie (credential / email+password login)
  const cookieStore = await cookies()
  const raw = cookieStore.get('session-user')?.value
  if (raw) {
    try {
      const user = JSON.parse(raw) as SessionUser
      if (user?.id && user?.role) return { user }
    } catch {
      // malformed cookie, fall through
    }
  }

  // 2. NextAuth session (Google / GitHub OAuth login)
  const nextAuthSession = await auth()
  if (nextAuthSession?.user) {
    return {
      user: {
        id: nextAuthSession.user.id as string,
        email: nextAuthSession.user.email ?? '',
        name: nextAuthSession.user.name ?? null,
        role: (nextAuthSession.user.role as SessionUser['role']) ?? 'USER',
      },
    }
  }

  return null
}
