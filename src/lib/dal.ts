import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export const verifySession = cache(async () => {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect('/admin/login')
  }

  return { isAuth: true, userId: session.user.id, user: session.user }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const data = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
    const user = data[0]

    return user
  } catch {
    console.log('Failed to fetch user')
    return null
  }
})
