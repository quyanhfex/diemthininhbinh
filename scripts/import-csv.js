// Chạy: node scripts/import-csv.js
// Cần đặt SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CSV_DIR = path.join(__dirname, '../../')  // thư mục chứa các file diemthivao10_XX.csv

function parseCSV(text) {
  const lines = text.split('\n').slice(1)
  const rows = []
  for (const line of lines) {
    const m = line.match(/"?(\d{6})"?/)
    if (!m) continue
    const sbd = m[1]
    const ma_tinh = sbd.slice(0, 2)

    const van      = parseFloat(line.match(/Ngữ văn[^:]*:\s*([\d.]+)/)?.[1] ?? '') || null
    const toan     = parseFloat(line.match(/Toán[^:]*:\s*([\d.]+)/)?.[1] ?? '') || null
    const ngoai_ngu = parseFloat(line.match(/Ngoại ngữ[^:]*:\s*([\d.]+)/)?.[1] ?? '') || null
    const tong     = ((van ?? 0) + (toan ?? 0) + (ngoai_ngu ?? 0))

    rows.push({ sbd, ma_tinh, van, toan, ngoai_ngu, tong: Math.round(tong * 100) / 100 })
  }
  return rows
}

async function main() {
  const files = fs.readdirSync(CSV_DIR).filter(f => f.match(/^diemthivao10_\d+\.csv$/))
  console.log(`Tìm thấy ${files.length} file CSV`)

  let total = 0
  for (const file of files) {
    const text = fs.readFileSync(path.join(CSV_DIR, file), 'utf-8')
    const rows = parseCSV(text)

    // Upsert theo batch 500
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500)
      const { error } = await supabase.from('diem_thi').upsert(batch, { onConflict: 'sbd' })
      if (error) { console.error(`Lỗi ${file}:`, error.message); break }
    }

    total += rows.length
    console.log(`✓ ${file}: ${rows.length} dòng`)
  }

  console.log(`\nXong! Tổng ${total} bản ghi.`)
}

main().catch(console.error)
