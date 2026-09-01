"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsappButton() {
  const phoneNumber = "01142264140"; // استبدلي الرقم برقم الواتساب الخاص بالشركة
  const message = encodeURIComponent("مرحباً، أود الاستفسار عن منتجات NGTC الأورجانيك.");

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1b7e41] text-white px-5 py-3 rounded-full shadow-xl hover:bg-[#146031] transition-all duration-300 transform hover:scale-105"
      aria-label="اطلب عبر الواتساب"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span className="font-bold text-sm">اطلب عبر الواتساب</span>
    </a>
  );
}