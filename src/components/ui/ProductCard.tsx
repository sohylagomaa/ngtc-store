"use client";

import Image from "next/image";
import { Product } from "@/src/data/products";

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between" dir="rtl">
      
      {/* Product Image Container (Full Width Top) */}
      <div className="relative w-full h-64 bg-slate-50 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Weight Badge */}
        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {product.weight}
        </span>
      </div>

      {/* Product Details & Button */}
      <div className="p-6 flex flex-col flex-grow justify-between text-right">
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-[#1b7e41] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-black text-[#1b7e41]">
              {product.price} <span className="text-xs font-medium text-slate-500">EGP</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={() => onOpenDetails(product)}
            className="w-full text-center hover:bg-[#1b7e41] text-[#1b7e41] hover:text-white font-bold text-sm py-3 rounded-2xl transition-all duration-300 shadow-sm border border-[#1b7e41]"
          >
            عرض التفاصيل
          </button>
        </div>
      </div>

    </div>
  );
}