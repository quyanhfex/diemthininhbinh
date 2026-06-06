import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { ten_truong, sbd, ma_tinh } = await req.json()
  if (!ten_truong || !sbd || !ma_tinh) {
    return NextResponse.json({ error: 'Thiếu tham số' }, { status: 400 })
  }
  const { error } = await supabase.from('search_log').insert({ ten_truong, sbd, ma_tinh })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
