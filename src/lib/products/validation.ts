import { z } from "zod";

export const productSchema = z.object({
  id: z
    .string()
    .min(1, "رقم المنتج مطلوب"),

  name: z
    .string()
    .min(2, "اسم المنتج يجب أن يحتوي على حرفين على الأقل"),

  price: z
    .number({
      error: "يرجى إدخال سعر صحيح",
    })
    .positive("السعر يجب أن يكون أكبر من صفر"),

  weight: z
    .string()
    .min(1, "يرجى إدخال وزن المنتج"),

  category: z
    .string()
    .min(1, "يرجى اختيار تصنيف المنتج"),

  image: z
    .string()
    .min(1, "يرجى إضافة صورة للمنتج"),

  description: z
    .string()
    .min(10, "وصف المنتج يجب أن يحتوي على 10 أحرف على الأقل"),

  chefRecommendations: z
    .array(
      z.string().min(1, "التوصية لا يمكن أن تكون فارغة")
    )
    .min(1, "يرجى إضافة توصية واحدة على الأقل"),
});

export const updateProductSchema = productSchema
  .omit({ id: true })
  .partial();