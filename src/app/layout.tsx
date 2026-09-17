import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGTC - المحاصيل العضوية الفاخرة",
  description: "منتجات أورجانيك طازجة عالية الجودة بدون مبيدات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased text-slate-800 bg-[#fafaf9] relative min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}