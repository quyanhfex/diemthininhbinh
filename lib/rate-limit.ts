import { NextRequest } from 'next/server'

// Rate limit in-memory đơn giản theo IP (sliding window).
// Lưu ý: Vercel serverless có nhiều instance nên giới hạn không tuyệt đối,
// nhưng đủ chặn bot dò hàng loạt trên cùng một instance.

const WINDOW_MS = 60_000 // 1 phút
const MAX_REQUESTS = 10  // 10 lượt / phút / IP

// Map<ip, danh sách timestamp các request gần đây>
const hits = new Map<string, number[]>()

// Dọn rác định kỳ để Map không phình mãi
let lastCleanup = Date.now()
function cleanup(now: number) {
  if (now - lastCleanup < WINDOW_MS) return
  lastCleanup = now
  for (const [ip, times] of hits) {
    const recent = times.filter(t => now - t < WINDOW_MS)
    if (recent.length === 0) hits.delete(ip)
    else hits.set(ip, recent)
  }
}

export function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export interface RateResult {
  ok: boolean
  remaining: number
  retryAfter: number // giây
}

export function checkRateLimit(ip: string): RateResult {
  const now = Date.now()
  cleanup(now)

  const times = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS)

  if (times.length >= MAX_REQUESTS) {
    const oldest = times[0]
    const retryAfter = Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    hits.set(ip, times)
    return { ok: false, remaining: 0, retryAfter }
  }

  times.push(now)
  hits.set(ip, times)
  return { ok: true, remaining: MAX_REQUESTS - times.length, retryAfter: 0 }
}
