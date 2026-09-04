"use client";

import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Star, MessageSquarePlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Review {
  id?: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export default function HomeReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        // جلب أحدث 3 تقييمات فقط للرئيسية
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const fetched: Review[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Review);
        });
        setReviews(fetched);
      } catch (error) {
        console.error("Error fetching latest reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReviews();
  }, []);

  return (
    <section className="w-full bg-[#F7F7F4] py-20 px-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Link to All Reviews */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
              آراء عملائنا
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">
              اكتشف لماذا يثق الطهاة وأصحاب الذوق الرفيع في منتجاتنا.
            </p>
          </div>

          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-[#1b7e41] hover:text-[#146031] font-bold text-sm transition-colors w-max"
          >
            <span>قراءة جميع الآراء</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">جاري تحميل الآراء...</div>
        ) : reviews.length > 0 ? (
          // ** الحالة الأولى: لو فيه تقييمات (تعرض أحدث التقييمات) **
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, index) => (
              <div
                key={rev.id || index}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1b7e41] flex items-center justify-center font-black text-sm">
                    {rev.name ? rev.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{rev.name}</h4>
                    <span className="text-xs text-emerald-600 font-medium">{rev.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ** الحالة الثانية: لو لسا مفيش أي تقييمات (رسالة بديلة شيك) **
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-md text-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-emerald-50 text-[#1b7e41] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد تقييمات منشورة بعد</h3>
            <p className="text-slate-500 text-xs md:text-sm mb-6">
              كن أول من يشاركنا تقييمه لتجربته مع منتجات NGTC الطازجة والمستدامة!
            </p>
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#1b7e41] hover:bg-[#146031] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              أضف تقييمك الآن
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}