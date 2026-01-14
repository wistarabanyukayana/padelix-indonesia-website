"use client";

import { useActionState, useEffect, useState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { ActionState } from "@/types";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, {} as ActionState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-brand shadow-xl border border-neutral-200">
        <div className="text-center mb-8">
          <h1 className="h2 text-neutral-900 leading-tight">Admin Login</h1>
          <p className="text-neutral-500 mt-2">Masuk untuk mengelola website Padelix</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@padelix.co.id"
              className="p-2.5 md:p-3 text-sm md:text-base bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
              required
            />
            {state?.error?.email && <p className="text-red-500 text-xs font-bold">{state.error.email[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full p-2.5 md:p-3 pr-10 text-sm md:text-base bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {state?.error?.password && <p className="text-red-500 text-xs font-bold">{state.error.password[0]}</p>}
          </div>

          {state?.message && !state.success && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-bold">
              {state.message}
            </div>
          )}

          <Button type="submit" variant="dark" className="w-full mt-4 h-11 md:h-12 text-sm md:text-base shadow-lg shadow-neutral-900/10" disabled={isPending}>
            {isPending ? "Sedang Masuk..." : "Login ke Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
