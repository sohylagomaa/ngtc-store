"use client";

import { useState } from "react";
import HeroSlider from "@/src/components/HeroSlider";
import { products, Product } from "@/src/data/products";
import ProductCard from "@/src/components/ui/ProductCard";
import ProductModal from "@/src/components/ui/ProductModal";
import Link from "next/link";
import Image from "next/image";
import { Play, ShieldCheck, Sprout } from "lucide-react";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const featuredProducts = products.slice(0, 6);

  return (
    
    <main dir="rtl" className="min-h-screen bg-[#fafaf9]">
      <HeroSlider />
      {/* Background Watermark Logo */}
<div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden opacity-[0.04]">
  <div className="relative w-[900px] h-[900px]">
    <Image
      src="/images/logo.png"
      alt="Watermark"
      fill
      className="object-contain"
    />
  </div>
</div>

      {/* Products Section */}
      <section id="products" className="max-w-6xl mx-auto py-20 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
          منتجاتنا الطازجة
        </h2>
        <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto mb-12">
          تشكيلة مختارة بعناية من الخضروات والمحاصيل نزرعها يومياً لنضمن الجودة العالية على مدار العام.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={(prod) => setSelectedProduct(prod)}
            />
          ))}
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#1b7e41] hover:bg-[#146031] text-white text-sm font-bold px-7 py-4 rounded-full transition-colors"
        >
          <span>عرض جميع المنتجات</span>
          <span>←</span>
        </Link>
      </section>

      {/* Video Banner Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="relative w-full h-[320px] md:h-[380px] rounded-[32px] overflow-hidden shadow-xl flex items-center justify-end p-8 md:p-12 text-white">
          <Image
            src="/images/farm-video-thumb.jpg" // صورة مزرعة بتركيز غامق
            alt="NGTC Farm"
            fill
            className="object-cover brightness-50"
          />
          
          <div className="relative z-10 max-w-md text-right space-y-4">
            <h3 className="text-xl md:text-2xl font-bold leading-snug">
              شاهد كيف نضمن لك أعلى جودة من المزرعة إلى مائدتك
            </h3>
            
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl w-max border border-white/10">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>100% زراعة مائية</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl w-max border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>0% مبيدات</span>
              </div>
            </div>
          </div>

          {/* Play Button Overlay */}
          <button className="absolute left-10 md:left-16 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-white text-white ml-1" />
          </button>
        </div>
      </section>

      {/* Product Popup Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}