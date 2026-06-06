import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diem-thi-web.vercel.app"),
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <body className={`${beVietnam.className} min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
