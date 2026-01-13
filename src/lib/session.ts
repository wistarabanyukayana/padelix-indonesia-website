import 'server-only'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from '@/types'

const secretKey = process.env.SESSION_SECRET
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production")
}
const key = new TextEncoder().encode(secretKey || "dev-fallback-secret-key-change-me")

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(user: SessionPayload['user']) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session = await encrypt({ user, expires })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  // Ensure permissions array exists
  if (payload.user && !Array.isArray(payload.user.permissions)) {
    payload.user.permissions = [];
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const newSession = await encrypt({ ...payload, expires })
  
  cookieStore.set('session', newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
