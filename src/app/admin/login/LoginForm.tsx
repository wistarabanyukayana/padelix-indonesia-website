"use client";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { ActionState } from "@/types";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, {} as ActionState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-brand border border-neutral-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="h2 leading-tight text-neutral-900">Admin Login</h1>
          <p className="mt-2 text-neutral-500">
            Masuk untuk mengelola website Padelix
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@padelix.co.id"
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-sm transition-all outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green md:p-3 md:text-base"
              required
            />
            {state?.error?.email && (
              <p className="text-xs font-bold text-red-500">
                {state.error.email[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 pr-10 text-sm transition-all outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green md:p-3 md:text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {state?.error?.password && (
              <p className="text-xs font-bold text-red-500">
                {state.error.password[0]}
              </p>
            )}
          </div>

          {state?.message && !state.success && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            variant="dark"
            className="mt-4 h-11 w-full text-sm shadow-lg shadow-neutral-900/10 md:h-12 md:text-base"
            disabled={isPending}
          >
            {isPending ? "Sedang Masuk..." : "Login ke Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
