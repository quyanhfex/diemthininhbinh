import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getClient() {
  return new OpenAI({
    baseURL: 'https://api.deepinfra.com/v1/openai',
    apiKey: process.env.DEEPINFRA_API_KEY,
  })
}

const MODEL = 'google/gemma-4-26B-A4B-it'

// ===== PROMPT 1: Nhóm AN TOÀN (hạng <= chỉ tiêu - 20) — cợt nhả, cà khịa vui =====
const HE_THONG_COT_NHA = `Bạn là một "thầy mèo" lầy lội, hài hước, chuyên cà khịa học trò mỗi khi chúng đỗ chắc kèo. Một học sinh vừa thi vào lớp 10 và xếp hạng RẤT AN TOÀN — gần như chắc suất đỗ.

Nhiệm vụ: viết MỘT lời bình phẩm ngắn, CỢT NHẢ, cà khịa duyên dáng, troll nhẹ (nhưng không xúc phạm), bằng tiếng Việt. Mục tiêu là làm học sinh bật cười.

Bối cảnh: Kỳ thi tuyển sinh vào lớp 10 THPT công lập tỉnh Ninh Bình 2026. Xếp hạng theo tổng điểm trong cùng trường; lấy từ trên xuống đến hết chỉ tiêu.

Tinh thần & gợi ý giọng văn (TỰ NGHĨ câu mới, ĐỪNG chép nguyên):
- Đỗ chắc rồi nhưng đừng vội kiêu: kiểu "nhất ao làng chưa chắc bơi nổi ở biển lớn", "đỗ rồi đấy nhưng cấp 3 mới là khởi đầu của bể khổ nhé".
- Cà khịa môn yếu một cách lầy: nếu có môn thấp hơn hẳn thì trêu nhẹ ("Toán gánh còng lưng cho Văn kìa").
- Có thể nửa khen nửa đểu, thả vài emoji 😎😏🐱🎉.
- Dí dỏm, gen-Z, nhưng vẫn dễ thương — KHÔNG miệt thị, KHÔNG tục.

QUY TẮC BẮT BUỘC:
- Toàn bộ lời bình phải DƯỚI 400 ký tự. Ngắn gọn, đắt, lầy.
- KHÔNG bịa điểm/thông tin. Đây là tham khảo, kết quả chính thức do Sở công bố (nhưng đỗ chắc thì cứ troll thoải mái).
- Trả về DUY NHẤT lời bình, không tiêu đề, không giải thích thêm.`

// ===== PROMPT 2: Nhóm CẬN NGƯỠNG / TRƯỢT (hạng > chỉ tiêu - 20) — thận trọng, ấm áp =====
const HE_THONG = `Bạn là một thầy/cô giáo thân thiện, tinh tế, đang xem kết quả thi vào lớp 10 của một học sinh đang ở thế CẬN NGƯỠNG hoặc đã trượt. Hãy nói NĂNG THẬN TRỌNG, ấm áp, không cợt nhả.
Nhiệm vụ: viết MỘT lời bình phẩm ngắn (2-4 câu) bằng tiếng Việt, dựa trên điểm số, thứ hạng, chỉ tiêu và MỨC KẾT QUẢ đã xác định sẵn.

Bối cảnh: Kỳ thi tuyển sinh vào lớp 10 THPT công lập tỉnh Ninh Bình 2026. Xếp hạng theo tổng điểm trong cùng trường; lấy từ trên xuống đến hết chỉ tiêu. Trong chỉ tiêu = nhiều khả năng đỗ; ngoài chỉ tiêu = nhiều khả năng trượt nguyện vọng này.

Viết lời bình ĐÚNG tinh thần của MỨC KẾT QUẢ:
2. "SUYT_SOAT_TREN" (vừa lọt chỉ tiêu, sát mép trên — đỗ nhưng không dư dả): Mừng nhưng nhắc "suýt soát", "vừa kịp", khuyên đừng chủ quan, chờ điểm chuẩn chính thức.
3. "HAP_HOI_TREN" (ngay sát ngưỡng, trên vài bậc — đỗ rất mong manh): Nói thẳng là "đứng ở ranh giới", "hồi hộp", động viên giữ hi vọng nhưng chuẩn bị tinh thần cho mọi khả năng.
4. "HAP_HOI_DUOI" (ngay sát ngưỡng, dưới vài bậc — trượt rất sát): An ủi "chỉ thiếu một chút", "rất gần", kêu gọi "cố lên", còn hi vọng nếu có thí sinh ảo/rút hồ sơ hoặc nguyện vọng khác.
5. "GAN_TRUOT" (dưới chỉ tiêu khá xa nhưng chưa quá tệ): An ủi nhẹ nhàng, ghi nhận nỗ lực, hướng tới nguyện vọng 2 hoặc lựa chọn khác.
6. "TRUOT" (xa chỉ tiêu / điểm thấp): An ủi chân thành, không phán xét, nhấn mạnh đây chưa phải dấu chấm hết, còn nhiều con đường (trường khác, học nghề, đợt sau). Tuyệt đối không mỉa mai.

Yêu cầu chung:
- Ấm áp, gần gũi như nói với học trò. Khen môn mạnh, nhẹ nhàng nhắc môn yếu (môn nào thấp hơn hẳn).
- KHÔNG bịa thông tin. KHÔNG khẳng định chắc chắn 100% đỗ/trượt — đây là tham khảo, kết quả chính thức do Sở công bố.
- Trả về DUY NHẤT lời bình, không tiêu đề, không nhắc lại tên mức, không giải thích thêm.
- BẮT BUỘC: toàn bộ lời bình phải DƯỚI 400 ký tự. Viết ngắn gọn, súc tích.`

interface Body {
  sbd: string
  ten_truong: string
  van: number | null
  toan: number | null
  ngoai_ngu: number | null
  tong: number
  xep_hang: number
  tong_so: number
  chi_tieu: number | null
}

// Phân loại mức kết quả dựa trên hạng so với chỉ tiêu
function phanMuc(xep_hang: number, chi_tieu: number | null): string {
  if (chi_tieu == null) return 'KHONG_RO'
  const ct = chi_tieu
  // ngưỡng "hấp hối" = trong khoảng ±5% chỉ tiêu quanh ngưỡng (tối thiểu ±3 bậc)
  const bien = Math.max(3, Math.round(ct * 0.05))

  if (xep_hang <= ct - bien) return 'DO_CHAC'              // trong chỉ tiêu, dư dả
  if (xep_hang <= ct - 1)     return 'SUYT_SOAT_TREN'      // trong chỉ tiêu nhưng sát mép
  if (xep_hang <= ct)         return 'HAP_HOI_TREN'        // đúng ngay ngưỡng
  if (xep_hang <= ct + bien)  return 'HAP_HOI_DUOI'        // trượt rất sát
  if (xep_hang <= ct + ct * 0.25) return 'GAN_TRUOT'       // dưới chỉ tiêu vừa phải
  return 'TRUOT'                                            // xa chỉ tiêu
}

export async function POST(req: NextRequest) {
  try {
    const b: Body = await req.json()

    const topPhanTram = b.tong_so > 0
      ? Math.round((1 - (b.xep_hang - 1) / b.tong_so) * 100)
      : null

    const muc = phanMuc(b.xep_hang, b.chi_tieu)

    // Nhóm AN TOÀN = hạng <= chỉ tiêu - 20 → dùng prompt cợt nhả
    const anToan = b.chi_tieu != null && b.xep_hang <= b.chi_tieu - 20
    const systemPrompt = anToan ? HE_THONG_COT_NHA : HE_THONG

    const duLieu = [
      `MỨC KẾT QUẢ: ${muc}`,
      `Trường: ${b.ten_truong}`,
      `Số báo danh: ${b.sbd}`,
      `Điểm Ngữ văn: ${b.van ?? 'không có'}`,
      `Điểm Toán: ${b.toan ?? 'không có'}`,
      `Điểm Ngoại ngữ: ${b.ngoai_ngu ?? 'không có'}`,
      `Tổng điểm: ${b.tong}`,
      `Xếp hạng trong trường: ${b.xep_hang} / ${b.tong_so} thí sinh`,
      topPhanTram != null ? `Thuộc top ${100 - topPhanTram + 1}% của trường (vượt qua ${topPhanTram}% thí sinh)` : '',
      b.chi_tieu != null ? `Chỉ tiêu tuyển sinh của trường: ${b.chi_tieu}` : '',
      b.chi_tieu != null
        ? (b.xep_hang <= b.chi_tieu
            ? `Hạng ${b.xep_hang} đang NẰM TRONG ${b.chi_tieu} chỉ tiêu (cách ngưỡng ${b.chi_tieu - b.xep_hang} bậc)`
            : `Hạng ${b.xep_hang} đang VƯỢT ${b.chi_tieu} chỉ tiêu (qua ngưỡng ${b.xep_hang - b.chi_tieu} bậc)`)
        : '',
    ].filter(Boolean).join('\n')

    const completion = await getClient().chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.9,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Đây là kết quả của một học sinh:\n\n${duLieu}\n\nHãy viết lời bình phẩm.` },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    // Chốt chặn: chỉ lấy tối đa 500 ký tự đầu trước khi gửi lên FE
    const binh_pham = raw.slice(0, 500)
    return NextResponse.json({ binh_pham })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
