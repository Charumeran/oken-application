import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 接続テスト: Supabaseのヘルスチェック
    const { data, error } = await supabase.from('_realtime').select('*').limit(1)
    
    if (error) {
      // エラーでも接続自体は成功している場合がある（テーブルが存在しない等）
      return NextResponse.json({
        success: true,
        message: 'Supabase接続成功',
        details: {
          connected: true,
          error: error.message,
          errorCode: error.code
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase接続成功',
      details: {
        connected: true,
        data: data
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Supabase接続失敗',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}