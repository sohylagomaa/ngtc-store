import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم - NGTC",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}