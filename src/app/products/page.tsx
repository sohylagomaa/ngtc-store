"use client";

import { useState } from "react";
import { products, Product } from "@/src/data/products";
import ProductCard from "@/src/components/ui/ProductCard";
import ProductModal from "@/src/components/ui/ProductModal";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // عدد المنتجات لكل صفحة

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="min-h-screen bg-[#fafaf9] py-12 px-6 md:px-12 dir-rtl">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
          <span className="text-xl">🌿</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#1b7e41] mb-3">
          جميع المنتجات الأورجانيك الفاخرة
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
          استكشف محاصيلنا الطازجة المزروعة بأعلى معايير الجودة، من المزرعة إلى مائدتك مباشرة.
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetails={(prod) => setSelectedProduct(prod)}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors ${
                currentPage === page
                  ? "bg-[#1b7e41] text-white shadow-md"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Product Details Modal Popup */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}