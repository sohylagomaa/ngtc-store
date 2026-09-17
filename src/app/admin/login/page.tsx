"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import Spinner from "@/src/components/admin/Spinner";

interface LoginErrors {
  username: string;
  password: string;
}

const emptyErrors: LoginErrors = {
  username: "",
  password: "",
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>(emptyErrors);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const nextErrors: LoginErrors = { ...emptyErrors };
    let valid = true;

    if (!username.trim()) {
      nextErrors.username = "اسم المستخدم مطلوب";
      valid = false;
    }

    if (!password) {
      nextErrors.password = "كلمة المرور مطلوبة";
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  }

  function handleUsernameChange(value: string) {
    setUsername(value);

    if (errors.username) {
      setErrors((previous) => ({
        ...previous,
        username: "",
      }));
    }
    if (error) setError("");
  }

  function handlePasswordChange(value: string) {
    setPassword(value);

    if (errors.password) {
      setErrors((previous) => ({
        ...previous,
        password: "",
      }));
    }
    if (error) setError("");
  }

  const inputBase =
    "w-full rounded-xl border bg-slate-50 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white";

  const okBorder = "border-slate-300 focus:border-[#1b7e41]";
  const errorBorder = "border-red-400 bg-red-50/40 focus:border-red-500";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!validate()) {
      return;
    }

    const trimmedUsername = username.trim();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "حدث خطأ أثناء تسجيل الدخول");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10"
    >
      {/* Soft decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-[#1b7e41]/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[#1b7e41]/5 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <Image
                src="/images/logo.png"
                alt="NGTC Logo"
                fill
                priority
                className="object-contain p-1.5"
              />
            </div>

            <div className="text-right">
              <p className="text-2xl font-black tracking-wide text-slate-900">
                NGTC
              </p>
              <p className="-mt-0.5 text-xs text-slate-500">
                لوحة الإدارة
              </p>
            </div>
          </div>

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1b7e41]/10 text-[#1b7e41]">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            تسجيل الدخول
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            الدخول إلى لوحة التحكم الخاصة بالمتجر
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-bold text-slate-800"
              >
                اسم المستخدم
                <span className="mr-1 text-red-500" aria-hidden>
                  *
                </span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    handleUsernameChange(event.target.value)
                  }
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  disabled={loading}
                  aria-invalid={Boolean(errors.username)}
                  className={`${inputBase} py-3 pr-11 ${
                    errors.username ? errorBorder : okBorder
                  }`}
                />
              </div>

              {errors.username && (
                <p
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-bold text-slate-800"
              >
                كلمة المرور
                <span className="mr-1 text-red-500" aria-hidden>
                  *
                </span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    handlePasswordChange(event.target.value)
                  }
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  disabled={loading}
                  aria-invalid={Boolean(errors.password)}
                  className={`${inputBase} py-3 pl-12 pr-11 ${
                    errors.password ? errorBorder : okBorder
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 left-3 flex items-center text-slate-400 transition hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b7e41] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#146031] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b7e41] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          منطقة مخصصة لإدارة المتجر فقط
        </p>
      </div>
    </main>
  );
}