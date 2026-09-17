"use client";

import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Star, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface Review {
  id?: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  createdAt?: any;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // States لتخزين رسائل أخطاء الـ Validation
  const [errors, setErrors] = useState({
    name: "",
    role: "",
    comment: "",
  });

  const [averageRating, setAverageRating] = useState("5.0");
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched: Review[] = [];
      
      let sum = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Review;
        fetched.push({ id: doc.id, ...data });
        sum += Number(data.rating || 5);
      });

      setReviews(fetched);
      setTotalReviews(fetched.length);

      if (fetched.length > 0) {
        setAverageRating((sum / fetched.length).toFixed(1));
      } else {
        setAverageRating("5.0");
      }
    } catch (error) {
      console.error("Error fetching reviews: ", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // دالة التحقق من المدخلات
  const validateForm = () => {
    let isValid = true;
    let newErrors = { name: "", role: "", comment: "" };

    if (!name.trim()) {
      newErrors.name = "الاسم الكريم مطلوب.";
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = "الاسم يجب ألا يقل عن 3 أحرف.";
      isValid = false;
    }

    if (!role.trim()) {
      newErrors.role = "المسمى الوظيفي أو التخصص مطلوب.";
      isValid = false;
    }

    if (!comment.trim()) {
      newErrors.comment = "نص التجربة والتعليق مطلوب.";
      isValid = false;
    } else if (comment.trim().length < 10) {
      newErrors.comment = "التعليق قصير جداً، يجب ألا يقل عن 10 أحرف.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        name,
        role,
        comment,
        rating,
        createdAt: serverTimestamp(),
      });

      setName("");
      setRole("");
      setComment("");
      setRating(5);
      setErrors({ name: "", role: "", comment: "" });
      setSuccess(true);
      fetchReviews();

      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      console.error("Error adding review: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="w-full min-h-screen bg-[#fafaf9] py-20 px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-3">
            ماذا يقول عملاؤنا عن <span className="text-[#1b7e41]">NGTC</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
            نعتز بتجاربكم ونسعى دائماً لتقديم الأفضل لزراعة مستدامة ومثمرة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-6">أضف رأيك وتجربتك</h3>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-[#1b7e41] rounded-2xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>شكراً لك! تم إضافة تقييمك بنجاح وسيظهر للجميع.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-slate-700 ml-2">تقييمك:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating || rating) >= star
                            ? "text-amber-400 fill-current"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">الاسم الكريم</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="مثال: أحمد محمود"
                    className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none transition-colors ${
                      errors.name ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-[#1b7e41]"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">المسمى الوظيفي / التخصص</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (errors.role) setErrors({ ...errors, role: "" });
                    }}
                    placeholder="مثال: مهندس زراعي / شيف عمومي"
                    className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none transition-colors ${
                      errors.role ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-[#1b7e41]"
                    }`}
                  />
                  {errors.role && (
                    <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">شاركنا تجربتك بالتفصيل</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (errors.comment) setErrors({ ...errors, comment: "" });
                  }}
                  placeholder="اكتب تجربتك مع منتجات NGTC وكيف ساعدتك في عملك..."
                  className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none transition-colors resize-none ${
                    errors.comment ? "border-red-400 bg-red-50/30" : "border-slate-200 focus:border-[#1b7e41]"
                  }`}
                />
                {errors.comment && (
                  <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.comment}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-[#1b7e41] hover:bg-[#146031] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <span>{loading ? "جاري الإرسال..." : "إرسال التقييم"}</span>
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-lg flex flex-col items-center text-center">
            {totalReviews > 0 ? (
              <>
                <span className="text-5xl font-black text-slate-800 mb-2">{averageRating}</span>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium mb-6">
                  من أصل {totalReviews} تقييم حقيقي
                </p>
              </>
            ) : (
              <div className="py-6">
                <div className="w-16 h-16 bg-emerald-50 text-[#1b7e41] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                  ⭐
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">كن أول من يشاركنا رأيه!</h4>
                <p className="text-xs text-slate-500 mb-6">شاركنا تجربتك الآن ليظهر تقييمك للجميع.</p>
              </div>
            )}

            <div className="w-full bg-emerald-50 text-[#1b7e41] text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 mt-auto">
              <CheckCircle2 className="w-4 h-4" />
              <span>آراء موثقة من عملاء حقيقيين</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {reviews.map((rev, index) => (
            <div key={rev.id || index} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between">
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
      </div>
    </section>
  );
}