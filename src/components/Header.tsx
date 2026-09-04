"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Menu, X } from "lucide-react";

const phoneNumber = "201142264140";
const message = encodeURIComponent("مرحباً، أود الاستفسار عن منتجات NGTC الأورجانيك.");
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 py-2 px-6 md:px-12" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0">
            <Image
              src="/images/logo.png"
              alt="NGTC Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl md:text-3xl font-black text-[#1b7e41] tracking-wider">
            NGTC
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10 text-slate-800 font-bold text-base md:text-lg">
          <Link href="/" className="text-[#1b7e41] border-b-2 border-[#1b7e41] pb-1">
            الرئيسية
          </Link>
          <Link href="#products" className="hover:text-[#1b7e41] transition-colors">
            منتجاتنا
          </Link>
          <Link href="#about" className="hover:text-[#1b7e41] transition-colors">
            عن الشركة
          </Link>
          <Link href="#reviews" className="hover:text-[#1b7e41] transition-colors">
            آراء العملاء
          </Link>
        </nav>

        {/* Action Button & Burger Menu Toggle */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${phoneNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex bg-[#1b7e41] hover:bg-[#146031] text-white text-sm md:text-base font-bold px-6 py-2.5 rounded-full items-center gap-2 transition-all shadow-sm"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>اطلب عبر الواتساب</span>
          </a>

          {/* Burger Icon Button (Mobile Only) */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-slate-700 hover:text-[#1b7e41] transition-colors rounded-lg bg-slate-100"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[77px] bg-white border-b border-slate-200 shadow-xl py-6 px-8 flex flex-col gap-5 text-slate-800 font-bold text-lg animate-in slide-in-from-top duration-200 z-40">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1b7e41] py-1 border-b border-slate-100"
          >
            الرئيسية
          </Link>
          <Link
            href="/products"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#1b7e41] py-1 border-b border-slate-100 transition-colors"
          >
            منتجاتنا
          </Link>
          <Link
            href="#about"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#1b7e41] py-1 border-b border-slate-100 transition-colors"
          >
            عن الشركة
          </Link>
          <Link
            href="#reviews"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#1b7e41] py-1 border-b border-slate-100 transition-colors"
          >
            آراء العملاء
          </Link>
          <Link
            href="#contact"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#1b7e41] py-1 transition-colors"
          >
            تواصل معنا
          </Link>

          <a
            href="https://wa.me/201142264140"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden mt-2 bg-[#1b7e41] text-white text-base font-bold py-3 rounded-full flex items-center justify-center gap-2 text-center"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>اطلب عبر الواتساب</span>
          </a>
        </div>
      )}
    </header>
  );
}