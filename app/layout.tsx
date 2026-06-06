import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diemthininhbinh-ten.vercel.app"),
  title: "Tra cứu điểm thi vào lớp 10 Ninh Bình 2026 — Xếp hạng & tổng điểm các môn",
  description:
    "Tra cứu điểm thi tuyển sinh vào lớp 10 tỉnh Ninh Bình năm 2026 nhanh nhất. Xem điểm Ngữ văn, Toán, Ngoại ngữ, tổng điểm và thứ hạng của bạn trong trường THPT. Tra điểm theo số báo danh miễn phí.",
  keywords:
    "điểm thi vào 10 Ninh Bình, tra cứu điểm thi vào 10 Ninh Bình 2026, xếp hạng điểm thi lớp 10, điểm chuẩn vào 10 Ninh Bình, tra điểm theo số báo danh, điểm thi tuyển sinh lớp 10 2026, điểm thi vào 10 Ninh Bình 2026",
  icons: {
    icon: "/avt.png",
    apple: "/avt.png",
  },
  openGraph: {
    images: ["/avt.png"],
    title: "Tra cứu điểm thi vào lớp 10 Ninh Bình 2026 — Xếp hạng & tổng điểm các môn",
    description:
      "Tra cứu điểm thi vào lớp 10 Ninh Bình 2026: điểm Văn, Toán, Ngoại ngữ, tổng điểm và thứ hạng trong trường theo số báo danh.",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tra cứu điểm thi vào lớp 10 Ninh Bình 2026",
    description: "Xem điểm Văn, Toán, Ngoại ngữ, tổng điểm và xếp hạng trong trường.",
    images: ["/avt.png"],
  },
  alternates: {
    canonical: "/",
  },
};

// Structured data (JSON-LD) giúp Google hiểu nội dung + hiện rich snippet
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Tra cứu điểm thi vào 10 Ninh Bình 2026",
      url: "https://diemthininhbinh-ten.vercel.app",
      inLanguage: "vi-VN",
      description:
        "Tra cứu điểm thi tuyển sinh vào lớp 10 tỉnh Ninh Bình năm 2026 theo số báo danh: điểm Văn, Toán, Ngoại ngữ, tổng điểm, xếp hạng trong trường và dự đoán đỗ/trượt.",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Làm sao tra cứu điểm thi vào lớp 10 Ninh Bình 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Chọn trường THPT của bạn, nhập số báo danh 6 chữ số, hệ thống sẽ hiển thị điểm Ngữ văn, Toán, Ngoại ngữ, tổng điểm và xếp hạng trong trường.",
          },
        },
        {
          "@type": "Question",
          name: "Web có biết tôi đỗ hay trượt không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Có. Hệ thống so thứ hạng của bạn với chỉ tiêu tuyển sinh thật của trường để dự đoán khả năng đỗ hoặc trượt (chỉ mang tính tham khảo, không phải kết quả chính thức của Sở GD&ĐT).",
          },
        },
        {
          "@type": "Question",
          name: "Tra cứu điểm thi vào 10 Ninh Bình có mất phí không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hoàn toàn miễn phí. Bạn chỉ cần số báo danh và tên trường để tra cứu.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${beVietnam.className} min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        {children}
        {/* Nội dung SEO render sẵn ở server — Google đọc được dù trang chính là client component.
            Ẩn khỏi mắt người dùng nhưng vẫn nằm trong HTML. */}
        <div className="sr-only">
          <h2>Tra cứu điểm thi vào lớp 10 Ninh Bình năm 2026</h2>
          <p>
            Website tra cứu điểm thi tuyển sinh vào lớp 10 THPT tỉnh Ninh Bình năm học 2025 - 2026.
            Học sinh nhập số báo danh và chọn trường để xem điểm thi ba môn Ngữ văn, Toán, Ngoại ngữ,
            tổng điểm xét tuyển, thứ hạng trong trường và xếp hạng từng môn.
          </p>
          <p>
            Ngoài tra điểm, hệ thống còn so sánh thứ hạng với chỉ tiêu tuyển sinh của trường để
            dự đoán khả năng đỗ hoặc trượt nguyện vọng, giúp thí sinh và phụ huynh nắm bắt cơ hội
            trúng tuyển vào các trường THPT công lập tại Ninh Bình.
          </p>
          <p>
            Các từ khóa liên quan: điểm thi vào 10 Ninh Bình 2026, tra cứu điểm thi lớp 10,
            điểm chuẩn vào 10 Ninh Bình, xếp hạng điểm thi tuyển sinh, tra điểm theo số báo danh.
          </p>
        </div>
      </body>
    </html>
  );
}
