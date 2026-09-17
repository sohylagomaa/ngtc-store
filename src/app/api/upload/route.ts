import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { requireAdmin } from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "غير مصرح لك بتنفيذ هذه العملية" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "لم يتم إرسال صورة" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "يسمح فقط بصور JPG أو PNG أو WEBP" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "حجم الصورة يجب ألا يتجاوز 5MB" },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filename = `products/${crypto.randomUUID()}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);

    return NextResponse.json(
      { message: "حدث خطأ أثناء رفع الصورة" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "غير مصرح لك بتنفيذ هذه العملية" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { message: "رابط الصورة مطلوب" },
        { status: 400 }
      );
    }

    await del(url);

    return NextResponse.json({
      message: "تم حذف الصورة بنجاح",
    });
  } catch (error) {
    console.error("DELETE /api/upload error:", error);

    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف الصورة" },
      { status: 500 }
    );
  }
}