import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Đếm số người có điểm cao hơn (rank = count + 1)
async function demCaoHon(ma_tinh: string, cot: string, diem: number | null) {
  if (diem == null) return null
  const { count } = await supabase
    .from('diem_thi')
    .select('*', { count: 'exact', head: true })
    .eq('ma_tinh', ma_tinh)
    .gt(cot, diem)
  return (count ?? 0) + 1
}

export async function GET(req: NextRequest) {
  const sbd = req.nextUrl.searchParams.get('sbd')?.trim()
  const ma_tinh = req.nextUrl.searchParams.get('ma_tinh')?.trim()

  if (!sbd || !ma_tinh) {
    return NextResponse.json({ error: 'Thiếu tham số' }, { status: 400 })
  }

  // Lấy điểm của SBD
  const { data: row, error } = await supabase
    .from('diem_thi')
    .select('sbd, van, toan, ngoai_ngu')
    .eq('sbd', sbd)
    .eq('ma_tinh', ma_tinh)
    .single()

  if (error || !row) {
    return NextResponse.json({ error: 'Không tìm thấy SBD' }, { status: 404 })
  }

  const tong = Math.round(((row.van ?? 0) + (row.toan ?? 0) + (row.ngoai_ngu ?? 0)) * 100) / 100

  // Tổng số học sinh trong trường
  const { count: total } = await supabase
    .from('diem_thi')
    .select('*', { count: 'exact', head: true })
    .eq('ma_tinh', ma_tinh)

  // Xếp hạng tổng + từng môn (chạy song song)
  const [hangTong, hangVan, hangToan, hangNn] = await Promise.all([
    demCaoHon(ma_tinh, 'tong', tong),
    demCaoHon(ma_tinh, 'van', row.van),
    demCaoHon(ma_tinh, 'toan', row.toan),
    demCaoHon(ma_tinh, 'ngoai_ngu', row.ngoai_ngu),
  ])

  return NextResponse.json({
    sbd: row.sbd,
    van: row.van,
    toan: row.toan,
    ngoai_ngu: row.ngoai_ngu,
    tong,
    tong_so: total ?? 0,
    xep_hang: hangTong ?? 0,
    hang_van: hangVan,
    hang_toan: hangToan,
    hang_nn: hangNn,
  })
}
