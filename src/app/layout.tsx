import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import Header from "@/src/components/Header";
import WhatsappButton from "@/src/components/WhatsappButton";

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
        
        {/* Background Watermark */}
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.015] select-none">
  <div className="relative w-[600px] h-[600px]">
    <Image src="/images/logo.jpeg" alt="Watermark" fill className="object-contain" priority />
  </div>
</div>

        {/* Page Content */}
        <div className="relative z-10">
          <Header />
          {children}
          <WhatsappButton />
        </div>

      </body>
    </html>
  );
}