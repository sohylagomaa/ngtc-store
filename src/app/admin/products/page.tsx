"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Tracks the currently uploaded image that has not been saved yet.
  const [temporaryImageUrl, setTemporaryImageUrl] =
    useState<string | null>(null);

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

  const totalPages = Math.ceil(
    products.length / PRODUCTS_PER_PAGE
  );

  const currentProducts = useMemo(() => {
    const start =
      (currentPage - 1) * PRODUCTS_PER_PAGE;

    return products.slice(
      start,
      start + PRODUCTS_PER_PAGE
    );
  }, [products, currentPage]);

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
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
    if (!temporaryImageUrl) return;

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: temporaryImageUrl,
        }),
      });

      if (!response.ok) {
        console.error(
          "Failed to delete temporary image:",
          temporaryImageUrl
        );
      }
    } catch (error) {
      console.error(
        "Temporary image cleanup error:",
        error
      );
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

  function updateRecommendation(
    index: number,
    value: string
  ) {
    setForm((previous) => {
      const recommendations = [
        ...previous.chefRecommendations,
      ];

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
      chefRecommendations: [
        ...previous.chefRecommendations,
        "",
      ],
    }));
  }

  function removeRecommendation(index: number) {
    setForm((previous) => {
      const recommendations =
        previous.chefRecommendations.filter(
          (_, recommendationIndex) =>
            recommendationIndex !== index
        );

      return {
        ...previous,
        chefRecommendations:
          recommendations.length > 0
            ? recommendations
            : [""],
      };
    });
  }

  function validateImageUrl(value: string) {
    try {
      const url = new URL(value);

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
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
      errors.name =
        "اسم المنتج يجب أن يحتوي على حرفين على الأقل";
    } else if (name.length > 100) {
      errors.name =
        "اسم المنتج يجب ألا يتجاوز 100 حرف";
    }

    // Price
    if (!price) {
      errors.price = "السعر مطلوب";
    } else if (
      !/^\d+(\.\d{1,2})?$/.test(price)
    ) {
      errors.price =
        "أدخل سعرًا صحيحًا مثل 150 أو 150.50";
    } else if (Number(price) <= 0) {
      errors.price =
        "السعر يجب أن يكون أكبر من صفر";
    } else if (Number(price) > 1000000) {
      errors.price = "السعر غير منطقي";
    }

    // Weight
    if (!weight) {
      errors.weight = "الوزن مطلوب";
    } else if (weight.length < 2) {
      errors.weight = "أدخل وزنًا صحيحًا";
    } else if (weight.length > 50) {
      errors.weight =
        "الوزن يجب ألا يتجاوز 50 حرف";
    }

    // Category
    if (!category) {
      errors.category = "التصنيف مطلوب";
    } else if (category.length < 2) {
      errors.category = "التصنيف غير صحيح";
    } else if (category.length > 50) {
      errors.category =
        "التصنيف يجب ألا يتجاوز 50 حرف";
    }

    // Image URL
    if (!image) {
      errors.image = "رابط الصورة مطلوب";
    } else if (!validateImageUrl(image)) {
      errors.image =
        "أدخل رابط صورة صحيح يبدأ بـ http:// أو https://";
    }

    // Description
    if (!description) {
      errors.description = "وصف المنتج مطلوب";
    } else if (description.length < 10) {
      errors.description =
        "الوصف يجب أن يحتوي على 10 أحرف على الأقل";
    } else if (description.length > 1000) {
      errors.description =
        "الوصف يجب ألا يتجاوز 1000 حرف";
    }

    // Recommendations
    const recommendations =
      form.chefRecommendations
        .map((item) => item.trim())
        .filter(Boolean);

    if (recommendations.length === 0) {
      errors.chefRecommendations =
        "أضف توصية واحدة على الأقل";
    } else {
      const hasInvalidRecommendation =
        form.chefRecommendations.some(
          (item) => item.trim().length === 0
        );

      if (hasInvalidRecommendation) {
        errors.chefRecommendations =
          "لا يمكن ترك أي توصية فارغة";
      }

      const hasLongRecommendation =
        recommendations.some(
          (item) => item.length > 300
        );

      if (hasLongRecommendation) {
        errors.chefRecommendations =
          "كل توصية يجب ألا تتجاوز 300 حرف";
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    const recommendations =
      form.chefRecommendations
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

      const isEditing =
        editingProduct !== null;

      const response = await fetch(
        isEditing
          ? `/api/products/${editingProduct._id}`
          : "/api/products",
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
        setGeneralError(
          data.message ||
            "حدث خطأ أثناء حفظ المنتج"
        );
        return;
      }

      if (isEditing) {
        setProducts((previous) =>
          previous.map((product) =>
            product._id === editingProduct._id
              ? data
              : product
          )
        );

        setSuccessMessage(
          "تم تعديل المنتج بنجاح"
        );
      } else {
        setProducts((previous) => [
          data,
          ...previous,
        ]);

        setCurrentPage(1);

        setSuccessMessage(
          "تم إضافة المنتج بنجاح"
        );
      }

      // The image is now saved with the product,
      // so it must NOT be deleted during cleanup.
      setTemporaryImageUrl(null);

      setIsModalOpen(false);
      setEditingProduct(null);
      setForm({ ...emptyForm });
      setFormErrors({});
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setGeneralError(
        "تعذر الاتصال بالخادم، حاول مرة أخرى"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteProduct) return;

    try {
      setDeleting(true);
      setGeneralError("");

      const response = await fetch(
        `/api/products/${deleteProduct._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(
          data.message ||
            "حدث خطأ أثناء حذف المنتج"
        );
        return;
      }

      setProducts((previous) =>
        previous.filter(
          (item) =>
            item._id !== deleteProduct._id
        )
      );

      setDeleteProduct(null);

      setSuccessMessage(
        "تم حذف المنتج بنجاح"
      );
    } catch {
      setGeneralError(
        "تعذر الاتصال بالخادم، حاول مرة أخرى"
      );
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

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormErrors((previous) => ({
        ...previous,
        image:
          "يسمح فقط بصور JPG أو PNG أو WEBP",
      }));

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setFormErrors((previous) => ({
        ...previous,
        image:
          "حجم الصورة يجب ألا يتجاوز 5MB",
      }));

      event.target.value = "";

      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      setUploadProgress(50);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "فشل رفع الصورة"
        );
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
      if (temporaryImageUrl) {
        try {
          const deleteResponse =
            await fetch("/api/upload", {
              method: "DELETE",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                url: temporaryImageUrl,
              }),
            });

          if (!deleteResponse.ok) {
            console.error(
              "Failed to delete previous temporary image:",
              temporaryImageUrl
            );
          }
        } catch (error) {
          console.error(
            "Previous temporary image cleanup error:",
            error
          );
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
      console.error(
        "Image upload error:",
        error
      );

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

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              لوحة التحكم
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              إدارة منتجات المتجر
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              المنتجات
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              إجمالي المنتجات:{" "}
              <span className="font-semibold text-slate-700">
                {products.length}
              </span>
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            + إضافة منتج
          </button>
        </div>

        {/* Page Error */}
        {pageError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {pageError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="text-sm font-medium text-slate-500">
              جاري تحميل المنتجات...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !pageError &&
          products.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <p className="font-semibold text-slate-800">
                لا توجد منتجات حاليًا
              </p>

              <p className="mt-2 text-sm text-slate-500">
                ابدأ بإضافة أول منتج للمتجر
              </p>
            </div>
          )}

        {/* Table */}
        {!loading &&
          !pageError &&
          currentProducts.length > 0 && (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-sm font-bold">
                          المنتج
                        </th>

                        <th className="px-6 py-4 text-sm font-bold">
                          السعر
                        </th>

                        <th className="px-6 py-4 text-sm font-bold">
                          الوزن
                        </th>

                        <th className="px-6 py-4 text-sm font-bold">
                          التصنيف
                        </th>

                        <th className="px-6 py-4 text-sm font-bold">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentProducts.map(
                        (product) => (
                          <tr
                            key={product._id}
                            className="border-b border-slate-100 transition hover:bg-slate-50 last:border-b-0"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                                />

                                <p className="font-semibold text-slate-900">
                                  {product.name}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                                {product.price.toLocaleString()}{" "}
                                جنيه
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                              {product.weight}
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                                {product.category}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    openEditModal(
                                      product
                                    )
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                  تعديل
                                </button>

                                <button
                                  onClick={() =>
                                    setDeleteProduct(
                                      product
                                    )
                                  }
                                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                    <button
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              1
                            )
                        )
                      }
                      disabled={currentPage === 1}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      السابق
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        {
                          length: totalPages,
                        },
                        (_, index) =>
                          index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                          className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                            currentPage === page
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalPages
                            )
                        )
                      }
                      disabled={
                        currentPage === totalPages
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      التالي
                    </button>
                  </div>

                  <p className="mt-3 text-center text-sm text-slate-500">
                    الصفحة {currentPage} من{" "}
                    {totalPages}
                  </p>
                </>
              )}
            </>
          )}
      </section>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct
                    ? "تعديل المنتج"
                    : "إضافة منتج جديد"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  أدخل بيانات المنتج بدقة
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving || uploadingImage
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
              noValidate
            >
              {/* General Error */}
              {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {generalError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  اسم المنتج
                </label>

                <input
                  type="text"
                  value={form.name}
                  maxLength={100}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="مثال: صوص الطماطم"
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                    formErrors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />

                {formErrors.name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Price + Weight */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    السعر
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="مثال: 150"
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      formErrors.price
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-300 focus:border-slate-900"
                    }`}
                  />

                  {formErrors.price && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    الوزن
                  </label>

                  <input
                    type="text"
                    maxLength={50}
                    value={form.weight}
                    onChange={(event) =>
                      updateField(
                        "weight",
                        event.target.value
                      )
                    }
                    placeholder="مثال: 500 جرام"
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      formErrors.weight
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-300 focus:border-slate-900"
                    }`}
                  />

                  {formErrors.weight && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {formErrors.weight}
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  التصنيف
                </label>

                <input
                  type="text"
                  maxLength={50}
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                  placeholder="مثال: صوصات"
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                    formErrors.category
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />

                {formErrors.category && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  صورة المنتج
                </label>

                <div
                  className={`rounded-xl border-2 border-dashed p-5 transition ${
                    formErrors.image
                      ? "border-red-400 bg-red-50"
                      : "border-slate-300 bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  <input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={
                      uploadingImage ||
                      saving
                    }
                    className="hidden"
                  />

                  <label
                    htmlFor="product-image"
                    className={`flex cursor-pointer flex-col items-center justify-center ${
                      uploadingImage ||
                      saving
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                      ↑
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      {uploadingImage
                        ? "جاري رفع الصورة..."
                        : "اضغط لاختيار صورة"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      JPG, PNG أو WEBP — بحد أقصى 5MB
                    </p>
                  </label>

                  {uploadingImage && (
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">
                          جاري الرفع
                        </span>

                        <span className="font-bold text-slate-800">
                          {Math.round(
                            uploadProgress
                          )}
                          %
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-200"
                          style={{
                            width: `${uploadProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {formErrors.image && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {formErrors.image}
                  </p>
                )}

                {form.image &&
                  !uploadingImage && (
                    <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={form.image}
                        alt="معاينة صورة المنتج"
                        className="h-48 w-full object-cover"
                      />

                      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/70 px-4 py-2">
                        <p
                          dir="ltr"
                          className="truncate text-xs text-white"
                        >
                          {form.image}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Description */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">
                    وصف المنتج
                  </label>

                  <span className="text-xs text-slate-400">
                    {form.description.length}
                    /1000
                  </span>
                </div>

                <textarea
                  rows={5}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="اكتب وصفًا واضحًا للمنتج..."
                  className={`w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                    formErrors.description
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />

                {formErrors.description && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Chef Recommendations */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">
                    توصيات الشيف
                  </label>

                  <button
                    type="button"
                    onClick={addRecommendation}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    + إضافة توصية
                  </button>
                </div>

                <div className="space-y-3">
                  {form.chefRecommendations.map(
                    (
                      recommendation,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          maxLength={300}
                          value={recommendation}
                          onChange={(event) =>
                            updateRecommendation(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`التوصية ${
                            index + 1
                          }`}
                          className={`flex-1 rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                            formErrors.chefRecommendations
                              ? "border-red-400 focus:border-red-500"
                              : "border-slate-300 focus:border-slate-900"
                          }`}
                        />

                        {form
                          .chefRecommendations
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeRecommendation(
                                index
                              )
                            }
                            className="rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                {formErrors.chefRecommendations && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {
                      formErrors.chefRecommendations
                    }
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "جاري الحفظ..."
                    : editingProduct
                    ? "حفظ التعديلات"
                    : "إضافة المنتج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
                !
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  حذف المنتج
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  هل أنت متأكد أنك تريد حذف
                  المنتج{" "}
                  <span className="font-bold text-slate-800">
                    "{deleteProduct.name}"
                  </span>
                  ؟
                  <br />
                  لا يمكن التراجع عن هذه العملية.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteProduct(null)
                }
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "جاري الحذف..."
                  : "نعم، حذف المنتج"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
              ✓
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              تمت العملية بنجاح
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              حسنًا
            </button>
          </div>
        </div>
      )}

      {/* General Error Modal */}
      {generalError && !isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              حدث خطأ
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {generalError}
            </p>

            <button
              type="button"
              onClick={() =>
                setGeneralError("")
              }
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              حسنًا
            </button>
          </div>
        </div>
      )}
    </main>
  );
}