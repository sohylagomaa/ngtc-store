import { NextResponse } from "next/server";

import {
  createAdminToken,
  verifyAdminCredentials,
} from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, password } = body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      return NextResponse.json(
        {
          message: "اسم المستخدم وكلمة المرور مطلوبان",
        },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(
      username,
      password
    );

    if (!isValid) {
      return NextResponse.json(
        {
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    const token = await createAdminToken();

    const response = NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
    });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      {
        message: "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: 500 }
    );
  }
}