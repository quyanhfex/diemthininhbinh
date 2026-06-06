'use client'

import { useState, useRef, useEffect } from 'react'
import { MA_TINH_CO_DATA, TRUONG_TO_MA, MA_TO_TRUONG as MA_TO_TRUONG_REV, MA_TO_CHI_TIEU } from '@/lib/truong'

// Danh sách trường để chọn: gồm trường CÓ data + một số trường không có data
const DANH_SACH_TRUONG = [
  ...Object.keys(TRUONG_TO_MA),
  // Trường không có dữ liệu SBD (vẫn cho chọn, nhưng sẽ báo chưa có data)
  'THPT Hoa Lư A',
  'THPT Gia Viễn A',
  'THPT Kim Sơn A',
  'THPT Kim Sơn B',
  'THPT Kim Sơn C',
  'THPT Bình Minh',
  'THPT Yên Khánh A',
  'THPT Yên Khánh B',
  'THPT Vũ Duy Thanh',
  'THPT A Bình Lục',
  'THPT B Bình Lục',
  'THPT Lý Nhân',
  // Ngoài công lập
  'THPT Tô Hiến Thành',
  'THPT Trần Nhật Duật',
  'TH, THCS và THPT Nguyễn Công Trứ',
  'THPT Trần Quang Khải',
  'THPT Phan Bội Châu',
  'THPT Ý Yên',
  'THPT Đoàn Kết',
  'THPT Trương Hán Siêu',
  'THPT Hùng Vương',
  'THPT Nguyễn Công Trứ',
  'TH, THCS&THPT FPT',
  'THPT Nguyễn Công Hoan',
  'THCS&THPT Mensa',
  'Trường khác / Không có trong danh sách',
]
  .filter((t, i, arr) => arr.indexOf(t) === i) // bỏ trùng
  .sort((a, b) => {
    if (a.startsWith('Trường khác')) return 1
    if (b.startsWith('Trường khác')) return -1
    return a.localeCompare(b, 'vi')
  })

interface KetQua {
  sbd: string
  van: number
  toan: number
  ngoai_ngu: number
  tong: number
  xep_hang: number
  tong_so: number
  hang_van: number | null
  hang_toan: number | null
  hang_nn: number | null
}

type Step = 'truong' | 'sbd' | 'loading' | 'result'

export default function Home() {
  const [step, setStep] = useState<Step>('truong')
  const [tenTruong, setTenTruong] = useState('')
  const [search, setSearch] = useState('') // filter dropdown
  const [showDropdown, setShowDropdown] = useState(false)
  const [sbd, setSbd] = useState('')
  const [loading, setLoading] = useState(false)
  const [ketQua, setKetQua] = useState<KetQua | null>(null)
  const [error, setError] = useState('')
  // Lỗi SBD không khớp trường (có cấu trúc để hiển thị đẹp)
  const [mismatch, setMismatch] = useState<{ maNhap: string; tenDung: string | null } | null>(null)
  // Lời bình phẩm từ AI
  const [binhPham, setBinhPham] = useState('')
  // Tiến độ thanh loading 0..100
  const [progress, setProgress] = useState(0)
  const sbdInputRef = useRef<HTMLInputElement>(null)
  const truongBoxRef = useRef<HTMLDivElement>(null)

  // Click ra ngoài thì đóng dropdown chọn trường
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (truongBoxRef.current && !truongBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const maTinhPad = sbd.trim().slice(0, 2)
  const coData = sbd.trim().length >= 2 && MA_TINH_CO_DATA.includes(maTinhPad)
  const maCuaTruong = TRUONG_TO_MA[tenTruong] // mã đúng của trường đã chọn (nếu có data)

  const filtered = DANH_SACH_TRUONG.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  function chonTruong(ten: string) {
    setTenTruong(ten)
    setSearch(ten)
    setShowDropdown(false)
  }

  function confirmTruong() {
    if (!tenTruong) return
    setStep('sbd')
    setError('')
    setSbd('')
    setKetQua(null)
  }

  async function traDiem() {
    if (sbd.trim().length < 6) return

    // Trường được chọn không có dữ liệu SBD
    if (!maCuaTruong) {
      setError(`Trường "${tenTruong}" hiện chưa có dữ liệu tra cứu.`)
      return
    }

    if (!coData) {
      setError(`Mã ${maTinhPad} chưa có dữ liệu.`)
      return
    }

    // Kiểm tra SBD có khớp với trường đã chọn không
    if (maTinhPad !== maCuaTruong) {
      setMismatch({ maNhap: maTinhPad, tenDung: MA_TO_TRUONG_REV[maTinhPad] ?? null })
      return
    }

    setLoading(true)
    setError('')
    setMismatch(null)
    setBinhPham('')
    setKetQua(null)
    setProgress(0)
    setStep('loading')

    // Thanh tiến độ: bò dần tới 90% trong 3s; khi dữ liệu sẵn sàng thì vụt lên 100%
    const start = Date.now()
    const TONG_TG = 3000
    const progressTimer = setInterval(() => {
      const t = Date.now() - start
      // tới 90% trong 3s, rồi đứng chờ
      const p = Math.min(90, (t / TONG_TG) * 90)
      setProgress(prev => (p > prev ? p : prev))
    }, 50)

    try {
      // Gọi song song: tra điểm + (sau khi có điểm) lấy bình phẩm
      const res = await fetch(`/api/tra-diem?sbd=${sbd.trim()}&ma_tinh=${maTinhPad}`)
      const data = await res.json()
      if (!res.ok) {
        clearInterval(progressTimer)
        setError(data.error ?? 'Không tìm thấy SBD.')
        setLoading(false)
        setStep('sbd')
        return
      }

      // Ghi log (không chặn)
      fetch('/api/log-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ten_truong: tenTruong, sbd: sbd.trim(), ma_tinh: maTinhPad }),
      }).catch(() => {})

      // Lấy bình phẩm (chờ luôn, để hiện cùng lúc với điểm)
      let loiBinh = ''
      try {
        const bpRes = await fetch('/api/binh-pham', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sbd: data.sbd,
            ten_truong: tenTruong,
            van: data.van,
            toan: data.toan,
            ngoai_ngu: data.ngoai_ngu,
            tong: data.tong,
            xep_hang: data.xep_hang,
            tong_so: data.tong_so,
            chi_tieu: MA_TO_CHI_TIEU[data.sbd.slice(0, 2)] ?? null,
          }),
        })
        const bp = await bpRes.json()
        loiBinh = bp.binh_pham ?? ''
      } catch { /* bình phẩm lỗi thì để trống, không chặn */ }

      // Cả 2 đã xong → đảm bảo thanh đã chạy tối thiểu để mắt kịp thấy, rồi vụt 100%
      const conLai = Math.max(0, 400 - (Date.now() - start)) // tối thiểu ~0.4s
      await new Promise(r => setTimeout(r, conLai))

      clearInterval(progressTimer)
      setProgress(100)
      setKetQua(data)
      setBinhPham(loiBinh)

      // Đợi animation thanh đầy (300ms) rồi chuyển sang kết quả
      await new Promise(r => setTimeout(r, 350))
      setStep('result')
    } catch {
      clearInterval(progressTimer)
      setError('Lỗi kết nối, thử lại.')
      setStep('sbd')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('truong')
    setTenTruong('')
    setSearch('')
    setSbd('')
    setKetQua(null)
    setError('')
  }

  function traLai() {
    // Tra lại: giữ nguyên trường + mã tỉnh đầu, chỉ xóa SBD và kết quả
    setStep('sbd')
    setSbd('')
    setKetQua(null)
    setError('')
  }

  const phanTram = ketQua ? Math.round((1 - (ketQua.xep_hang - 1) / ketQua.tong_so) * 100) : 0

  // Chỉ tiêu của trường + dự đoán đỗ/trượt theo thứ hạng
  const chiTieu = ketQua ? MA_TO_CHI_TIEU[ketQua.sbd.slice(0, 2)] ?? null : null
  // Khoảng cách an toàn: trong chỉ tiêu, sát mép (90-100% chỉ tiêu), hay ngoài chỉ tiêu
  let duDoan: 'do' | 'cannhac' | 'truot' | null = null
  if (ketQua && chiTieu) {
    if (ketQua.xep_hang <= chiTieu * 0.9) duDoan = 'do'
    else if (ketQua.xep_hang <= chiTieu) duDoan = 'cannhac'
    else duDoan = 'truot'
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-400 to-indigo-400 flex flex-col items-center justify-center px-4 py-10">

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white overflow-hidden mb-4 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avt.png" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-white text-2xl font-extrabold tracking-tight leading-snug">
          Tra cứu điểm thi vào 10<br />Ninh Bình 2026
        </h1>
        <p className="text-blue-50 text-sm mt-2 max-w-xs mx-auto">
          Xem điểm Văn, Toán, Ngoại ngữ, tổng điểm và thứ hạng trong trường
        </p>
      </div>

      <div className={`w-full transition-all duration-300 ${step === 'result' ? 'max-w-4xl' : 'max-w-sm'}`}>

        {/* STEP 1: Chọn trường */}
        {step === 'truong' && (
          <div className="bg-white rounded-3xl shadow-2xl p-7">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Bước 1 / 2</p>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Chọn trường của bạn</h2>
            <p className="text-gray-400 text-sm mb-5">Tìm và chọn trường THPT</p>

            <div ref={truongBoxRef} className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm tên trường..."
                value={search}
                onChange={e => { setSearch(e.target.value); setTenTruong(''); setShowDropdown(true) }}
                onClick={() => setShowDropdown(true)}
                className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-colors"
              />
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-3 text-gray-400 text-sm">Không tìm thấy trường</div>
                  ) : filtered.map(t => (
                    <button
                      key={t}
                      onMouseDown={() => chonTruong(t)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors
                        ${tenTruong === t ? 'bg-blue-50 font-bold text-blue-700' : 'text-gray-700'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {tenTruong && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 mb-4">
                <span className="text-blue-500 text-lg">✓</span>
                <span className="text-blue-800 font-semibold text-sm">{tenTruong}</span>
              </div>
            )}

            <button
              onClick={confirmTruong}
              disabled={!tenTruong}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all
                bg-blue-600 hover:bg-blue-700 active:scale-95 text-white
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              Tiếp theo →
            </button>
          </div>
        )}

        {/* STEP 2: Nhập SBD */}
        {step === 'sbd' && (
          <div className="bg-white rounded-3xl shadow-2xl p-7">
            <button onClick={reset} className="text-blue-400 text-sm font-semibold mb-3 flex items-center gap-1 hover:text-blue-600">
              ← Đổi trường
            </button>

            <div className="bg-blue-50 rounded-xl px-3 py-2 mb-4 text-blue-800 font-semibold text-sm">
              🏫 {tenTruong}
            </div>

            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Bước 2 / 2</p>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Nhập số báo danh</h2>
            <p className="text-gray-400 text-sm mb-5">6 chữ số in trên phiếu dự thi</p>

            <div
              className="relative mb-2 cursor-text border-2 border-gray-200 focus-within:border-blue-500 rounded-2xl py-4 transition-colors"
              onClick={() => sbdInputRef.current?.focus()}
            >
              {/* input ẩn nhận sự kiện gõ/paste */}
              <input
                ref={sbdInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={sbd}
                autoFocus
                onChange={e => { setSbd(e.target.value.replace(/\D/g, '')); setError(''); setMismatch(null) }}
                onKeyDown={e => e.key === 'Enter' && traDiem()}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              />
              {/* 6 ký tự trong 1 box */}
              <div className="flex justify-center gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => {
                  const char = sbd[i] ?? ''
                  const isActive = i === sbd.length
                  return (
                    <span
                      key={i}
                      className={`w-7 text-center text-3xl font-mono font-bold
                        ${char ? 'text-gray-800' : isActive ? 'text-blue-400' : 'text-gray-300'}`}
                    >
                      {char || '_'}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Cảnh báo SBD không khớp trường — bố cục rõ ràng */}
            {mismatch && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden mb-3 mt-2">
                <div className="flex items-center gap-2 bg-amber-100 px-4 py-2">
                  <span>⚠️</span>
                  <span className="text-amber-800 font-bold text-sm">Số báo danh không khớp trường</span>
                </div>
                <div className="px-4 py-3 text-sm">
                  <div className="flex justify-between items-center pb-2.5">
                    <span className="text-gray-500">Trường bạn chọn</span>
                    <span className="font-semibold text-gray-800 text-right">{tenTruong}</span>
                  </div>
                  <div className="border-t-[3px] border-gray-800" />
                  <div className="flex justify-between items-center pt-2.5">
                    <span className="text-gray-500">SBD vừa nhập (mã {mismatch.maNhap})</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {mismatch.tenDung ?? 'Không xác định'}
                    </span>
                  </div>
                  <p className="text-amber-700 text-xs pt-1 border-t border-amber-100">
                    Hãy chọn lại đúng trường hoặc kiểm tra lại số báo danh.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-3 mt-2">
                <span className="text-amber-500 text-lg leading-none mt-0.5 shrink-0">⚠️</span>
                <p className="text-amber-800 text-[13px] leading-relaxed font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={traDiem}
              disabled={loading || sbd.length < 6}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all
                bg-blue-600 hover:bg-blue-700 active:scale-95 text-white
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang tra cứu...
                </span>
              ) : 'Tra điểm'}
            </button>
          </div>
        )}

        {/* LOADING — chờ cả điểm + lời nhắn, có thanh tiến độ */}
        {step === 'loading' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
            {/* Avatar mèo nhún nhảy */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-5 animate-bounce">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avt.png" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-700 font-bold text-lg mb-1">Đang xếp hạng...</p>
            <p className="text-gray-400 text-sm mb-6">Thầy mèo đang xem điểm và viết lời nhắn 🐱</p>

            {/* Thanh tiến độ */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-linear-to-r from-sky-400 to-indigo-500 transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2 font-mono">{Math.round(progress)}%</p>
          </div>
        )}

        {/* RESULT — 2 cột: trái lời nhắn (avatar), phải điểm/hạng/chỉ tiêu */}
        {step === 'result' && ketQua && (
          <div className="grid md:grid-cols-2 gap-4 items-start">

            {/* CỘT TRÁI: Lời nhắn từ thầy mèo */}
            <div className="flex flex-col gap-4 md:sticky md:top-6">
              <div className="bg-white rounded-3xl shadow-2xl p-6 animate-[fadeIn_0.5s_ease]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/avt.png" alt="thầy mèo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Thầy Mèo</p>
                    <p className="text-gray-400 text-xs">Lời nhắn dành cho bạn</p>
                  </div>
                </div>
                {/* Bong bóng chat */}
                <div className="relative bg-blue-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="text-gray-700 text-[15px] leading-relaxed">
                    {binhPham || 'Chúc mừng bạn đã hoàn thành kỳ thi! 🎓'}
                  </p>
                </div>
              </div>

              {/* Nút thao tác (desktop nằm cột trái) */}
              <div className="hidden md:grid grid-cols-2 gap-3">
                <button onClick={traLai} className="py-3 rounded-2xl font-bold text-sm bg-white/25 hover:bg-white/40 text-white transition-all">
                  Tra SBD khác
                </button>
                <button onClick={reset} className="py-3 rounded-2xl font-bold text-sm bg-white/15 hover:bg-white/30 text-white transition-all">
                  ← Đổi trường
                </button>
              </div>
            </div>

            {/* CỘT PHẢI: Điểm + hạng + chỉ tiêu */}
            <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="bg-blue-50 rounded-xl px-3 py-2 mb-4 text-blue-800 font-semibold text-sm text-center">
                🏫 {tenTruong}
              </div>

              <p className="text-gray-400 text-sm text-center mb-1">Số báo danh</p>
              <p className="text-3xl font-extrabold text-gray-800 font-mono text-center mb-4">{ketQua.sbd}</p>

              <div className="bg-linear-to-r from-sky-500 to-indigo-500 rounded-2xl py-5 px-4 mb-4 text-center">
                <p className="text-blue-100 text-sm mb-1">Tổng điểm</p>
                <p className="text-white text-6xl font-extrabold">{ketQua.tong}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Ngữ văn', value: ketQua.van, hang: ketQua.hang_van },
                  { label: 'Toán', value: ketQua.toan, hang: ketQua.hang_toan },
                  { label: 'Ngoại ngữ', value: ketQua.ngoai_ngu, hang: ketQua.hang_nn },
                ].map(({ label, value, hang }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl py-3 px-2 text-center">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <p className="text-gray-800 text-xl font-extrabold">{value ?? '—'}</p>
                    {hang != null && (
                      <p className="text-yellow-600 text-xs font-semibold mt-1">#{hang}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Xếp hạng tổng trong trường</p>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <span className="text-4xl font-extrabold text-yellow-500">#{ketQua.xep_hang}</span>
                  <span className="text-gray-400 text-sm ml-2">/ {ketQua.tong_so} thí sinh</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-blue-600">Top {100 - phanTram + 1}%</p>
                  <p className="text-gray-400 text-xs">trong trường</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-linear-to-r from-yellow-400 to-orange-400 transition-all duration-700"
                  style={{ width: `${phanTram}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2 text-right">Vượt qua {phanTram}% thí sinh</p>
            </div>

            {/* Chỉ tiêu + dự đoán đỗ/trượt */}
            {chiTieu && (
              <div className="bg-white rounded-3xl shadow-2xl p-6">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Chỉ tiêu tuyển sinh</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-extrabold text-blue-600">{chiTieu}</span>
                    <span className="text-gray-400 text-sm ml-2">chỉ tiêu</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Hạng của bạn</p>
                    <p className="text-xl font-extrabold text-gray-800">#{ketQua.xep_hang}</p>
                  </div>
                </div>

                {duDoan === 'do' && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-bold text-green-700 text-sm">Khả năng đỗ cao</p>
                      <p className="text-green-600 text-xs">Hạng #{ketQua.xep_hang} nằm trong {chiTieu} chỉ tiêu.</p>
                    </div>
                  </div>
                )}
                {duDoan === 'cannhac' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold text-amber-700 text-sm">Sát mép chỉ tiêu</p>
                      <p className="text-amber-600 text-xs">Hạng #{ketQua.xep_hang} gần ngưỡng {chiTieu}. Cần theo dõi điểm chuẩn chính thức.</p>
                    </div>
                  </div>
                )}
                {duDoan === 'truot' && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="font-bold text-red-700 text-sm">Khả năng đỗ thấp</p>
                      <p className="text-red-600 text-xs">Hạng #{ketQua.xep_hang} vượt quá {chiTieu} chỉ tiêu.</p>
                    </div>
                  </div>
                )}

                <p className="text-gray-300 text-[11px] mt-3 text-center">
                  * Chỉ mang tính tham khảo, không phải kết quả chính thức.
                </p>
              </div>
            )}

            {/* Nút thao tác — mobile (cuối cột phải) */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              <button onClick={traLai} className="py-4 rounded-2xl font-bold text-sm bg-white/25 hover:bg-white/40 text-white transition-all">
                Tra SBD khác
              </button>
              <button onClick={reset} className="py-4 rounded-2xl font-bold text-sm bg-white/15 hover:bg-white/30 text-white transition-all">
                ← Đổi trường
              </button>
            </div>
            </div>{/* hết cột phải */}
          </div>
        )}
      </div>

      <p className="text-white/70 text-xs mt-10 text-center">
        Dữ liệu từ kỳ thi tuyển sinh vào lớp 10 tỉnh Ninh Bình năm 2026
      </p>
    </div>
  )
}
