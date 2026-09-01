"use client";

import Image from "next/image";
import { Product } from "@/src/data/products";

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group">
      {/* Product Image */}
      <div className="relative w-44 h-44 mb-4 transform group-hover:scale-105 transition-transform duration-300">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
        />
      </div>

      {/* Product Details */}
      <h3 className="text-lg font-bold text-slate-800 mb-1">{product.name}</h3>
      <p className="text-sm font-black text-[#1b7e41] mb-4">EGP {product.price}</p>

      {/* Button */}
      <button
        onClick={() => onOpenDetails(product)}
        className="w-full py-2.5 px-4 rounded-xl border border-[#1b7e41] text-[#1b7e41] font-semibold text-sm hover:bg-[#1b7e41] hover:text-white transition-colors duration-200"
      >
        عرض التفاصيل
      </button>
    </div>
  );
}