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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div dir="rtl" className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row ">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-5 h-[#1b7e41]" />
        </button>

        {/* Content Side */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-[#1b7e41] text-xs font-semibold rounded-full mb-3">
              {product.weight}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{product.name}</h2>
            <p className="text-xl font-black text-[#1b7e41] mb-4">EGP {product.price}</p>
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
            href={`https://wa.me/201000000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#1b7e41] hover:bg-[#146031] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
          >
            <span>اطلب الآن عبر الواتساب</span>
            <Send className="w-4 h-4 rotate-180" />
          </a>
        </div>

        {/* Image Side */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-8 flex items-center justify-center relative min-h-[250px] md:min-h-full">
          <div className="relative w-full h-56 md:h-72">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}