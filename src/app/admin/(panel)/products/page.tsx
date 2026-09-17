"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminButton from "@/src/components/admin/Button";
import Field from "@/src/components/admin/Field";
import Modal from "@/src/components/admin/Modal";
import Spinner from "@/src/components/admin/Spinner";

interface Product {
  _id: string;
  name: string;
  price: number;
  weight: string;
  category: string;
  image: string;
  description: string;
  chefRecommendations: string[];
}

interface ProductForm {
  name: string;
  price: string;
  weight: string;
  category: string;
  image: string;
  description: string;
  chefRecommendations: string[];
}

type FormErrors = Partial<Record<keyof ProductForm, string>> & {
  chefRecommendations?: string;
};

const PRODUCTS_PER_PAGE = 8;

const emptyForm: ProductForm = {
  name: "",
  price: "",
  weight: "",
  category: "",
  image: "",
  description: "",
  chefRecommendations: [""],
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:border-red-500"
      : "border-slate-300 focus:border-[#1b7e41]"
  }`;

function ProductThumb({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}
      >
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      draggable={false}
      className={className}
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Tracks the currently uploaded image that has not been saved yet.
  const [temporaryImageUrl, setTemporaryImageUrl] = useState<string | null>(
    null
  );

  // Keep the latest temporary image URL for the cleanup timer.
  const temporaryImageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    temporaryImageUrlRef.current = temporaryImageUrl;
  }, [temporaryImageUrl]);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => setSuccessMessage(""), 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // Auto-dismiss the page-level error toast.
  useEffect(() => {
    if (!generalError || isModalOpen) return;

    const timer = setTimeout(() => setGeneralError(""), 6000);

    return () => clearTimeout(timer);
  }, [generalError, isModalOpen]);

  async function loadProducts() {
    try {
      setLoading(true);
      setPageError("");

      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setProducts(data);
    } catch {
      setPageError("حدث خطأ أثناء تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [products, currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function openAddModal() {
    setEditingProduct(null);
    setTemporaryImageUrl(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setGeneralError("");
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setTemporaryImageUrl(null);

    setForm({
      name: product.name,
      price: product.price.toString(),
      weight: product.weight,
      category: product.category,
      image: product.image,
      description: product.description,
      chefRecommendations:
        product.chefRecommendations.length > 0
          ? [...product.chefRecommendations]
          : [""],
    });

    setFormErrors({});
    setGeneralError("");
    setIsModalOpen(true);
  }

  async function deleteTemporaryImage() {
    if (!temporaryImageUrlRef.current) return;

    const url = temporaryImageUrlRef.current;

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        console.error("Failed to delete temporary image:", url);
      }
    } catch (error) {
      console.error("Temporary image cleanup error:", error);
    } finally {
      setTemporaryImageUrl(null);
    }
  }

  async function closeModal() {
    if (saving || uploadingImage) return;

    await deleteTemporaryImage();

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormErrors({});
    setGeneralError("");
    setForm({ ...emptyForm });
  }

  function updateField(
    field: keyof Omit<ProductForm, "chefRecommendations">,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  }

  function updateRecommendation(index: number, value: string) {
    setForm((previous) => {
      const recommendations = [...previous.chefRecommendations];

      recommendations[index] = value;

      return {
        ...previous,
        chefRecommendations: recommendations,
      };
    });

    setFormErrors((previous) => ({
      ...previous,
      chefRecommendations: "",
    }));
  }

  function addRecommendation() {
    setForm((previous) => ({
      ...previous,
      chefRecommendations: [...previous.chefRecommendations, ""],
    }));
  }

  function removeRecommendation(index: number) {
    setForm((previous) => {
      const recommendations = previous.chefRecommendations.filter(
        (_, recommendationIndex) => recommendationIndex !== index
      );

      return {
        ...previous,
        chefRecommendations:
          recommendations.length > 0 ? recommendations : [""],
      };
    });
  }

  function validateImageUrl(value: string) {
    try {
      const url = new URL(value);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  function validateForm(): boolean {
    const errors: FormErrors = {};

    const name = form.name.trim();
    const price = form.price.trim();
    const weight = form.weight.trim();
    const category = form.category.trim();
    const image = form.image.trim();
    const description = form.description.trim();

    // Name
    if (!name) {
      errors.name = "اسم المنتج مطلوب";
    } else if (name.length < 2) {
      errors.name = "اسم المنتج يجب أن يحتوي على حرفين على الأقل";
    } else if (name.length > 100) {
      errors.name = "اسم المنتج يجب ألا يتجاوز 100 حرف";
    }

    // Price
    if (!price) {
      errors.price = "السعر مطلوب";
    } else if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      errors.price = "أدخل سعرًا صحيحًا مثل 150 أو 150.50";
    } else if (Number(price) <= 0) {
      errors.price = "السعر يجب أن يكون أكبر من صفر";
    } else if (Number(price) > 1000000) {
      errors.price = "السعر غير منطقي";
    }

    // Weight
    if (!weight) {
      errors.weight = "الوزن مطلوب";
    } else if (weight.length < 2) {
      errors.weight = "أدخل وزنًا صحيحًا";
    } else if (weight.length > 50) {
      errors.weight = "الوزن يجب ألا يتجاوز 50 حرف";
    }

    // Category
    if (!category) {
      errors.category = "التصنيف مطلوب";
    } else if (category.length < 2) {
      errors.category = "التصنيف غير صحيح";
    } else if (category.length > 50) {
      errors.category = "التصنيف يجب ألا يتجاوز 50 حرف";
    }

    // Image URL
    if (!image) {
      errors.image = "رابط الصورة مطلوب";
    } else if (!validateImageUrl(image)) {
      errors.image = "أدخل رابط صورة صحيح يبدأ بـ http:// أو https://";
    }

    // Description
    if (!description) {
      errors.description = "وصف المنتج مطلوب";
    } else if (description.length < 10) {
      errors.description = "الوصف يجب أن يحتوي على 10 أحرف على الأقل";
    } else if (description.length > 1000) {
      errors.description = "الوصف يجب ألا يتجاوز 1000 حرف";
    }

    // Recommendations
    const recommendations = form.chefRecommendations
      .map((item) => item.trim())
      .filter(Boolean);

    if (recommendations.length === 0) {
      errors.chefRecommendations = "أضف توصية واحدة على الأقل";
    } else {
      const hasInvalidRecommendation = form.chefRecommendations.some(
        (item) => item.trim().length === 0
      );

      if (hasInvalidRecommendation) {
        errors.chefRecommendations = "لا يمكن ترك أي توصية فارغة";
      }

      const hasLongRecommendation = recommendations.some(
        (item) => item.length > 300
      );

      if (hasLongRecommendation) {
        errors.chefRecommendations = "كل توصية يجب ألا تتجاوز 300 حرف";
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    const recommendations = form.chefRecommendations
      .map((item) => item.trim())
      .filter(Boolean);

    const productData = {
      name: form.name.trim(),
      price: Number(form.price),
      weight: form.weight.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
      chefRecommendations: recommendations,
    };

    try {
      setSaving(true);

      const isEditing = editingProduct !== null;

      const response = await fetch(
        isEditing ? `/api/products/${editingProduct._id}` : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.message || "حدث خطأ أثناء حفظ المنتج");
        return;
      }

      if (isEditing) {
        setProducts((previous) =>
          previous.map((product) =>
            product._id === editingProduct._id ? data : product
          )
        );

        setSuccessMessage("تم تعديل المنتج بنجاح");
      } else {
        setProducts((previous) => [data, ...previous]);

        setCurrentPage(1);

        setSuccessMessage("تم إضافة المنتج بنجاح");
      }

      // The image is now saved with the product,
      // so it must NOT be deleted during cleanup.
      setTemporaryImageUrl(null);

      setIsModalOpen(false);
      setEditingProduct(null);
      setForm({ ...emptyForm });
      setFormErrors({});
    } catch (error) {
      console.error("Save product error:", error);

      setGeneralError("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteProduct) return;

    try {
      setDeleting(true);
      setGeneralError("");

      const response = await fetch(`/api/products/${deleteProduct._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.message || "حدث خطأ أثناء حذف المنتج");
        return;
      }

      setProducts((previous) =>
        previous.filter((item) => item._id !== deleteProduct._id)
      );

      setDeleteProduct(null);
      setGeneralError("");

      setSuccessMessage("تم حذف المنتج بنجاح");
    } catch {
      setGeneralError("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setDeleting(false);
    }
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setGeneralError("");

    setFormErrors((previous) => ({
      ...previous,
      image: "",
    }));

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFormErrors((previous) => ({
        ...previous,
        image: "يسمح فقط بصور JPG أو PNG أو WEBP",
      }));

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setFormErrors((previous) => ({
        ...previous,
        image: "حجم الصورة يجب ألا يتجاوز 5MB",
      }));

      event.target.value = "";

      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(50);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل رفع الصورة");
      }

      /*
       * If there is already a newly uploaded
       * temporary image in this modal session,
       * delete it before using the new image.
       *
       * Important:
       * An existing product image is NOT stored
       * in temporaryImageUrl, so it will never
       * be deleted here.
       */
      if (temporaryImageUrlRef.current) {
        try {
          const deleteResponse = await fetch("/api/upload", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: temporaryImageUrlRef.current,
            }),
          });

          if (!deleteResponse.ok) {
            console.error(
              "Failed to delete previous temporary image:",
              temporaryImageUrlRef.current
            );
          }
        } catch (error) {
          console.error("Previous temporary image cleanup error:", error);
        }
      }

      // Track the new image as temporary
      setTemporaryImageUrl(data.url);

      setForm((previous) => ({
        ...previous,
        image: data.url,
      }));

      setUploadProgress(100);
    } catch (error) {
      console.error("Image upload error:", error);

      setFormErrors((previous) => ({
        ...previous,
        image:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء رفع الصورة",
      }));
    } finally {
      setUploadingImage(false);
    }

    event.target.value = "";
  }

  const isFormBusy = saving || uploadingImage;

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">المنتجات</h1>

          <p className="mt-1 text-sm text-slate-500">
            إجمالي المنتجات:{" "}
            <span className="font-bold text-slate-700">{products.length}</span>
          </p>
        </div>

        <AdminButton onClick={openAddModal} size="lg" icon={<Plus className="h-4 w-4" />}>
          إضافة منتج جديد
        </AdminButton>
      </div>

      {/* Page error */}
      {pageError && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2.5 text-sm font-bold text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {pageError}
          </p>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={loadProducts}
            icon={<Spinner className="h-3.5 w-3.5" />}
          >
            إعادة المحاولة
          </AdminButton>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-3 w-1/4 rounded bg-slate-100" />
              </div>
              <div className="hidden h-9 w-20 rounded-lg bg-slate-100 sm:block" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !pageError &&
        products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageOpen className="h-8 w-8" />
            </div>

            <h2 className="text-lg font-black text-slate-900">
              لا توجد منتجات حاليًا
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              ابدأ بإضافة أول منتج للمتجر ليظهر للعملاء.
            </p>

            <AdminButton
              onClick={openAddModal}
              className="mt-6"
              icon={<Plus className="h-4 w-4" />}
            >
              إضافة منتج جديد
            </AdminButton>
          </div>
        )}

      {/* Products table / cards */}
      {!loading &&
        !pageError &&
        currentProducts.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3.5">المنتج</th>
                      <th className="px-5 py-3.5">السعر</th>
                      <th className="px-5 py-3.5">الوزن</th>
                      <th className="px-5 py-3.5">التصنيف</th>
                      <th className="px-5 py-3.5 text-left">
                        <span className="sr-only">الإجراءات</span>
                        الإجراءات
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {currentProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <ProductThumb
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
                            />

                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">
                                {product.name}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-700">
                            {product.price.toLocaleString()} جنيه
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {product.weight}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditModal(product)}
                              icon={<Pencil className="h-3.5 w-3.5" />}
                            >
                              تعديل
                            </AdminButton>

                            <AdminButton
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteProduct(product)}
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                            >
                              حذف
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <ProductThumb
                    src={product.image}
                    alt={product.name}
                    className="h-40 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="truncate font-bold text-slate-900">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-700">
                        {product.price.toLocaleString()} جنيه
                      </span>

                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                        {product.category}
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        {product.weight}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <AdminButton
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditModal(product)}
                        icon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        تعديل
                      </AdminButton>

                      <AdminButton
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => setDeleteProduct(product)}
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        حذف
                      </AdminButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:px-5">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(page - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="ml-1">→</span>
                    السابق
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition ${
                          currentPage === page
                            ? "bg-[#1b7e41] text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    التالي
                    <span className="mr-1">←</span>
                  </button>
                </div>

                <p className="mt-3 text-center text-sm text-slate-500">
                  الصفحة {currentPage} من {totalPages}
                </p>
              </div>
            )}
          </>
        )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          title={editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          subtitle="أدخل بيانات المنتج بدقة"
          size="lg"
          closeable={!isFormBusy}
          onClose={closeModal}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <AdminButton
                variant="secondary"
                className="sm:flex-1"
                onClick={closeModal}
                disabled={isFormBusy}
              >
                إلغاء
              </AdminButton>

              <AdminButton
                variant="primary"
                className="sm:flex-1"
                type="submit"
                loading={saving}
                disabled={uploadingImage}
                form="admin-product-form"
              >
                {saving
                  ? "جاري الحفظ..."
                  : editingProduct
                  ? "حفظ التعديلات"
                  : "إضافة المنتج"}
              </AdminButton>
            </div>
          }
        >
          <form
            id="admin-product-form"
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {generalError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {generalError}
              </div>
            )}

            <Field
              label="اسم المنتج"
              htmlFor="admin-product-name"
              required
              error={formErrors.name}
            >
              <input
                id="admin-product-name"
                type="text"
                maxLength={100}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="مثال: صوص الطماطم"
                aria-invalid={Boolean(formErrors.name)}
                className={inputClass(Boolean(formErrors.name))}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="السعر"
                htmlFor="admin-product-price"
                required
                error={formErrors.price}
              >
                <input
                  id="admin-product-price"
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="مثال: 150"
                  aria-invalid={Boolean(formErrors.price)}
                  className={inputClass(Boolean(formErrors.price))}
                />
              </Field>

              <Field
                label="الوزن"
                htmlFor="admin-product-weight"
                required
                error={formErrors.weight}
              >
                <input
                  id="admin-product-weight"
                  type="text"
                  maxLength={50}
                  value={form.weight}
                  onChange={(event) =>
                    updateField("weight", event.target.value)
                  }
                  placeholder="مثال: 500 جرام"
                  aria-invalid={Boolean(formErrors.weight)}
                  className={inputClass(Boolean(formErrors.weight))}
                />
              </Field>
            </div>

            <Field
              label="التصنيف"
              htmlFor="admin-product-category"
              required
              error={formErrors.category}
            >
              <input
                id="admin-product-category"
                type="text"
                maxLength={50}
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                placeholder="مثال: صوصات"
                aria-invalid={Boolean(formErrors.category)}
                className={inputClass(Boolean(formErrors.category))}
              />
            </Field>

            <Field
              label="صورة المنتج"
              htmlFor="admin-product-image"
              required
              error={formErrors.image}
            >
              <input
                id="admin-product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={isFormBusy}
                className="hidden"
              />

              <label
                htmlFor="admin-product-image"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                  isFormBusy
                    ? "cursor-not-allowed opacity-60"
                    : formErrors.image
                    ? "border-red-300 bg-red-50/40"
                    : "border-slate-300 bg-slate-50 hover:border-[#1b7e41] hover:bg-emerald-50/30"
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1b7e41] shadow-sm ring-1 ring-slate-200">
                  {uploadingImage ? (
                    <Spinner className="h-5 w-5" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </div>

                <p className="text-sm font-bold text-slate-800">
                  {uploadingImage
                    ? "جاري رفع الصورة..."
                    : "اضغط لاختيار صورة"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG أو WEBP — بحد أقصى 5MB
                </p>
              </label>

              {uploadingImage && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">
                      جاري رفع الصورة
                    </span>

                    <span className="font-black text-slate-900">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#1b7e41] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </Field>

            {form.image && !uploadingImage && (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <ProductThumb
                  src={form.image}
                  alt="معاينة صورة المنتج"
                  className="h-48 w-full object-cover"
                />

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-slate-950/70 px-4 py-2">
                  <p dir="ltr" className="truncate text-xs text-white">
                    {form.image}
                  </p>

                  <button
                    type="button"
                    onClick={() => updateField("image", "")}
                    className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    إزالة
                  </button>
                </div>
              </div>
            )}

            <Field
              label="وصف المنتج"
              htmlFor="admin-product-description"
              required
              error={formErrors.description}
              hint={`${form.description.length}/1000`}
            >
              <textarea
                id="admin-product-description"
                rows={5}
                maxLength={1000}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="اكتب وصفًا واضحًا للمنتج..."
                aria-invalid={Boolean(formErrors.description)}
                className={`${inputClass(Boolean(formErrors.description))} resize-none`}
              />
            </Field>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800">
                  توصيات الشيف
                  <span className="mr-1 text-red-500" aria-hidden>
                    *
                  </span>
                </label>

                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={addRecommendation}
                  icon={<Plus className="h-3.5 w-3.5" />}
                  disabled={isFormBusy}
                >
                  إضافة توصية
                </AdminButton>
              </div>

              <div className="space-y-3">
                {form.chefRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={300}
                      value={recommendation}
                      onChange={(event) =>
                        updateRecommendation(index, event.target.value)
                      }
                      placeholder={`التوصية ${index + 1}`}
                      disabled={isFormBusy}
                      className={inputClass(
                        Boolean(formErrors.chefRecommendations)
                      )}
                    />

                    {form.chefRecommendations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecommendation(index)}
                        aria-label={`حذف التوصية ${index + 1}`}
                        className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {formErrors.chefRecommendations && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {formErrors.chefRecommendations}
                </p>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <Modal
          title="حذف المنتج"
          subtitle="لا يمكن التراجع عن هذه العملية"
          size="sm"
          closeable={!deleting}
          onClose={() => {
            setDeleteProduct(null);
            setGeneralError("");
          }}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <AdminButton
                variant="secondary"
                className="sm:flex-1"
                onClick={() => {
                  setDeleteProduct(null);
                  setGeneralError("");
                }}
                disabled={deleting}
              >
                إلغاء
              </AdminButton>

              <AdminButton
                variant="danger"
                className="sm:flex-1"
                loading={deleting}
                onClick={confirmDelete}
                icon={<Trash2 className="h-4 w-4" />}
              >
                {deleting ? "جاري الحذف..." : "نعم، حذف المنتج"}
              </AdminButton>
            </div>
          }
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm leading-6 text-slate-600">
                هل أنت متأكد أنك تريد حذف المنتج{" "}
                <span className="font-bold text-slate-900">
                  {deleteProduct.name}
                </span>
                ؟ سيتم حذف الصورة أيضًا.
              </p>
            </div>
          </div>

          {generalError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {generalError}
            </div>
          )}
        </Modal>
      )}

      {/* Success toast */}
      {successMessage && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div
            role="status"
            className="animate-toast-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3.5 shadow-xl shadow-slate-200/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-5 w-5" />
            </span>

            <div>
              <p className="text-sm font-black text-slate-900">
                تمت العملية بنجاح
              </p>
              <p className="text-xs text-slate-500">{successMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="إغلاق الإشعار"
              className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page-level error toast (when no modal is open) */}
      {generalError && !isModalOpen && !deleteProduct && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div
            role="alert"
            className="animate-toast-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3.5 shadow-xl shadow-slate-200/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </span>

            <div>
              <p className="text-sm font-black text-slate-900">حدث خطأ</p>
              <p className="text-xs text-slate-500">{generalError}</p>
            </div>

            <button
              type="button"
              onClick={() => setGeneralError("")}
              aria-label="إغلاق الإشعار"
              className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}