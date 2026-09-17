import Image from "next/image";
import Header from "@/src/components/Header";
import WhatsappButton from "@/src/components/WhatsappButton";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}