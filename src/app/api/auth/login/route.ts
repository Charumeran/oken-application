import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SHARED_USERNAME = process.env.SHARED_USERNAME || 'admin'
const SHARED_PASSWORD = process.env.SHARED_PASSWORD || 'password123'
const SESSION_NAME = 'auth-session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === SHARED_USERNAME && password === SHARED_PASSWORD) {
      const cookieStore = await cookies()
      
      cookieStore.set(SESSION_NAME, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'ユーザーIDまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}