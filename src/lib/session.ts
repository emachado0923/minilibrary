import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'LIBRARIAN' | 'ADMIN'
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('session-user')?.value
  if (!raw) return null

  try {
    const user = JSON.parse(raw) as SessionUser
    if (!user?.id || !user?.role) return null
    return { user }
  } catch {
    return null
  }
}
