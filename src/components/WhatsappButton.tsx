"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsappButton() {
  const phoneNumber = "201142264140"; 
  const message = encodeURIComponent("مرحباً، أود الاستفسار عن منتجات NGTC الأورجانيك.");

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 justify-center bg-[#1b7e41] text-white w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-3 rounded-full shadow-xl hover:bg-[#146031] transition-all duration-300 transform hover:scale-105"
      aria-label="اطلب عبر الواتساب"
    >
      <MessageCircle className="w-6 h-6 md:w-5 md:h-5 fill-current" />
      <span className="hidden md:inline font-bold text-sm">اطلب عبر الواتساب</span>
    </a>
  );
}