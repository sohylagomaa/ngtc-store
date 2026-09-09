"use client";

import Image from "next/image";
import { X, Send } from "lucide-react";
import { Product } from "@/src/data/products";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  const whatsappMessage = encodeURIComponent(
    `مرحباً، أود طلب منتج: ${product.name} بسعر ${product.price} EGP`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div dir="rtl" className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-red-500 rounded-full shadow-lg transition-all duration-200 backdrop-blur-md"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5 font-bold" />
        </button>

        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[450px] bg-emerald-50/50 flex items-center justify-center overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content Side  */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div>
            <span className="inline-block px-3.5 py-1 bg-emerald-100 text-[#1b7e41] text-xs font-bold rounded-full mb-3">
              {product.weight}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">{product.name}</h2>
            <p className="text-2xl font-black text-[#1b7e41] mb-4">{product.price} <span className="text-sm font-medium text-slate-500">EGP</span></p>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {product.chefRecommendations?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  توصيات الشيف
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.chefRecommendations.map((rec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium"
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a
            href={`https://wa.me/201031616836?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#1b7e41] hover:bg-[#146031] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <span>اطلب الآن عبر الواتساب</span>
            <Send className="w-4 h-4 rotate-180" />
          </a>
        </div>

      </div>
    </div>
  );
}