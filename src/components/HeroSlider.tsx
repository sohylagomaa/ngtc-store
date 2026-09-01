"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sprout, Truck } from "lucide-react";

const slides = [
  {
    id: 1,
    badge: "مزرعة محلية 100%",
    title: "الجودة الفاخرة التي تستحقها مائدتك",
    description: "محاصيل أورجانيك منتقاة بعناية فائقة لتمنح أطباقك نكهة استثنائية لا تُنسى.",
    buttonText: "استكشف محاصيلنا الفاخرة",
    buttonLink: "/products",
    image: "/images/slider1.png",
  },
  {
    id: 2,
    badge: "قطفة طازجة يومياً",
    title: "نقاء وطعم طبيعي بدون أي مبيدات",
    description: "نستخدم أفضل التقنيات المائية المستدامة لحماية صحتك وصحة أسرتك.",
    buttonText: "تسوق المنتجات الطازجة",
    buttonLink: "/products",
    image: "/images/slider2.png",
  },
  {
    id: 3,
    badge: "توصيل طازج يومياً",
    title: "من مزارعنا الهيدروبونيك إلى مائدتك مباشرة",
    description: "نقطف أوراق الورقيات والأعشاب الفاخرة فور تأكيد طلبك لضمان أقصى درجات الطزاجة والنكهة.",
    buttonText: "اطلب محاصيلك الآن",
    buttonLink: "/products",
    image: "/images/slider3.png",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full text-slate-800" dir="rtl">
      {/* Slider Hero Container */}
      <div className="relative w-full h-[580px] md:h-[620px] flex items-center justify-center text-center px-4 overflow-hidden text-white">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center text-center px-4 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover brightness-[0.45]"
              priority={index === 0}
            />

            <div className="relative z-10 max-w-3xl space-y-5 mt-[-50px]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-lg font-medium">
                <span>{slide.badge}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-wide">
                {slide.title}
              </h1>

              <p className="text-slate-200 text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
                {slide.description}
              </p>

              <div className="pt-2">
                <Link
                  href={slide.buttonLink}
                  className="inline-block bg-[#1b7e41] hover:bg-[#146031] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Dots Navigation */}
        <div className="absolute bottom-20 z-30 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-[#1b7e41]" : "w-2 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Features Bar */}
      <div className="relative z-30 max-w-5xl mx-auto -mt-12 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-800">
          
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#1b7e41] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">خالية من المبيدات</h4>
              <p className="text-xs text-slate-500">صحة طبيعية بالكامل</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#1b7e41] shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">زراعة مستدامة</h4>
              <p className="text-xs text-slate-500">نحافظ على موارد الأرض</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#1b7e41] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">توصيل طازج</h4>
              <p className="text-xs text-slate-500">من المزرعة لباب بيتك</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}