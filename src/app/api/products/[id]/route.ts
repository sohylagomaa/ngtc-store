import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/src/lib/products/service";

import {
  updateProductSchema,
} from "@/src/lib/products/validation";

import { formatValidationErrors } from "@/src/lib/products/errors";
import { requireAdmin } from "@/src/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/products/:id
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          message: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/:id error:", error);

    return NextResponse.json(
      {
        message: "حدث خطأ أثناء جلب المنتج",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id
export async function PUT(
  request: Request,
  context: RouteContext
) {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { message: "غير مصرح لك بتنفيذ هذا الإجراء" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    const body = await request.json();

    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "يرجى تصحيح البيانات المدخلة",
          errors: formatValidationErrors(result.error),
        },
        { status: 400 }
      );
    }

    if (Object.keys(result.data).length === 0) {
      return NextResponse.json(
        {
          message: "يرجى إدخال بيانات لتحديث المنتج",
        },
        { status: 400 }
      );
    }

    // Get the old product before updating it
    const oldProduct = await getProductById(id);

    if (!oldProduct) {
      return NextResponse.json(
        {
          message: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    const product = await updateProduct(id, result.data);

    if (!product) {
      return NextResponse.json(
        {
          message: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    // If the image was changed, delete the old Blob image
    const imageChanged =
      result.data.image !== undefined &&
      result.data.image !== oldProduct.image;

    if (
      imageChanged &&
      oldProduct.image &&
      oldProduct.image.includes(
        ".public.blob.vercel-storage.com/"
      )
    ) {
      try {
        await del(oldProduct.image);
      } catch (blobError) {
        console.error(
          "Product updated, but old Blob image deletion failed:",
          blobError
        );
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products/:id error:", error);

    return NextResponse.json(
      {
        message: "حدث خطأ أثناء تحديث المنتج",
      },
      { status: 500 }
    );
  }
}
// DELETE /api/products/:id
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { message: "غير مصرح لك بتنفيذ هذا الإجراء" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    // Get the product first so we know which image belongs to it
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          message: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    // Delete product from MongoDB first
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        {
          message: "فشل حذف المنتج",
        },
        { status: 500 }
      );
    }

    // Delete image from Vercel Blob only if it is a Blob URL
    if (
      product.image &&
      product.image.includes(".public.blob.vercel-storage.com/")
    ) {
      try {
        await del(product.image);
      } catch (blobError) {
        console.error(
          "Product deleted, but Blob image deletion failed:",
          blobError
        );
      }
    }

    return NextResponse.json({
      message: "تم حذف المنتج والصورة بنجاح",
    });
  } catch (error) {
    console.error("DELETE /api/products/:id error:", error);

    return NextResponse.json(
      {
        message: "حدث خطأ أثناء حذف المنتج",
      },
      { status: 500 }
    );
  }
}