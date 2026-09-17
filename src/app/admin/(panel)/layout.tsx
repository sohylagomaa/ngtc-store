"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Package, Store } from "lucide-react";

const navItems = [
  { href: "/admin/products", label: "المنتجات", icon: Package },
];

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = navItems.some((item) =>
    pathname?.startsWith(item.href)
  );

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Logout should still navigate even if the API call fails.
    }

    router.push("/admin/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <Image
            src="/images/logo.png"
            alt="NGTC Logo"
            fill
            priority
            className="object-contain p-1"
          />
        </div>

        <div>
          <p className="text-base font-black leading-tight text-slate-900">
            NGTC
          </p>
          <p className="text-xs text-slate-500">لوحة التحكم</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          القائمة
        </p>

        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "bg-[#1b7e41] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Store className="h-5 w-5 shrink-0" />
          عرض المتجر
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {loggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col border-l border-slate-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pr-64">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="فتح القائمة"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src="/images/logo.png"
                alt="NGTC Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-base font-black text-slate-900">
              NGTC
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="تسجيل الخروج"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {isActive && (
          <div className="hidden border-b border-slate-200 bg-white lg:flex">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#1b7e41]" />
                <span className="text-sm font-bold text-slate-700">
                  منتجات المتجر
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
              </button>
            </div>
          </div>
        )}

        <main>
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}