import { NextResponse } from "next/server";
import {
  createProduct,
  getProducts,
} from "@/src/lib/products/service";
import { formatValidationErrors } from "@/src/lib/products/errors";
import { productSchema } from "@/src/lib/products/validation";

export async function GET() {
  try {
    const products = await getProducts();

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = productSchema.safeParse(body);

    if (!result.success) {
  return NextResponse.json(
    {
      message: "يرجى تصحيح البيانات المدخلة",
      errors: formatValidationErrors(result.error),
    },
    { status: 400 }
  );
}

    const product = await createProduct(result.data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}