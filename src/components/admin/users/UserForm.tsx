"use client";

import { useActionFeedback } from "@/components/admin/general/useActionFeedback";
import { useFormDirty } from "@/components/admin/general/useFormDirty";
import { useNewItemToast } from "@/components/admin/general/useNewItemToast";
import { Button } from "@/components/ui/Button";
import { ActionState, DBRole, DetailedUser, FormAction } from "@/types";
import { Eye, EyeOff, Save, Shield, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";

interface UserFormProps {
  action: FormAction;
  initialData?: DetailedUser;
  roles: DBRole[];
  currentUserId?: number | null;
  isSuperAdmin?: boolean;
}

export function UserForm({
  action,
  initialData,
  roles,
  currentUserId,
  isSuperAdmin = false,
}: UserFormProps) {
  const isNew = !initialData?.id;
  const [state, formAction, isPending] = useActionState(
    action,
    {} as ActionState,
  );
  const { hasNew, clearNewParam } = useNewItemToast("Pengguna berhasil dibuat");
  const formRef = useRef<HTMLFormElement>(null);

  useActionFeedback(state, isPending, {
    newItem: { hasNew, clearNewParam },
  });

  // Selected Roles State
  const [selectedRoles, setSelectedRoles] = useState<number[]>(
    initialData?.roles || [],
  );

  const { isDirty } = useFormDirty(formRef, {
    resetDeps: [initialData],
    watchDeps: [selectedRoles],
  });
  const isSelfEditing = !!initialData && currentUserId === initialData.id;
  const lockSelfChanges = isSelfEditing && !isSuperAdmin;
  const [showPassword, setShowPassword] = useState(false);

  const toggleRole = (roleId: number) => {
    if (lockSelfChanges) return;
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-8 pb-32"
    >
      {/* Hidden input for roles */}
      <input type="hidden" name="roles" value={JSON.stringify(selectedRoles)} />
      {lockSelfChanges && (
        <input
          type="hidden"
          name="isActive"
          value={initialData?.isActive ? "true" : "false"}
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Col: Basic Info */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-bold text-neutral-900">
              <UserIcon size={18} /> Informasi Akun
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-700">
                  Username
                </label>
                <input
                  name="username"
                  defaultValue={initialData?.username}
                  className="rounded border p-2.5 text-sm md:text-base"
                  required
                />
                {state?.error?.username && (
                  <p className="text-sm font-bold text-red-500">
                    {state.error.username[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={initialData?.email}
                  className="rounded border p-2.5 text-sm md:text-base"
                  required
                />
                {state?.error?.email && (
                  <p className="text-sm font-bold text-red-500">
                    {state.error.email[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-neutral-700">
                  Password{" "}
                  {initialData ? "(Kosongkan jika tidak ingin mengubah)" : ""}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full rounded border p-2.5 pr-10 text-sm md:text-base"
                    required={!initialData}
                    placeholder={
                      initialData ? "••••••••" : "Password minimal 6 karakter"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {state?.error?.password && (
                  <p className="text-sm font-bold text-red-500">
                    {state.error.password[0]}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2 rounded-lg bg-neutral-50 p-4 md:col-span-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={initialData?.isActive ?? true}
                    className="h-4 w-4 accent-brand-green"
                    disabled={lockSelfChanges}
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Akun Aktif (Dapat Login)
                  </span>
                </label>
              </div>
              {isSelfEditing && (
                <div
                  className={`rounded-lg border px-3 py-2 text-xs md:col-span-2 ${
                    isSuperAdmin
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500"
                  }`}
                >
                  {isSuperAdmin
                    ? "Anda sedang mengubah akun sendiri. Menonaktifkan akun atau mengurangi peran dapat membuat Anda kehilangan akses."
                    : "Anda tidak dapat menonaktifkan akun sendiri."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Roles Assignment */}
        <div className="flex flex-col gap-8">
          <div className="h-fit rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-bold text-neutral-900">
              <Shield size={18} /> Peran (Roles)
            </h2>
            <div className="flex flex-col gap-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    selectedRoles.includes(role.id)
                      ? "border-brand-green bg-brand-light ring-1 ring-brand-green"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  } ${lockSelfChanges ? "opacity-60" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold ${selectedRoles.includes(role.id) ? "text-brand-green" : "text-neutral-700"}`}
                    >
                      {role.name}
                    </span>
                    <span className="text-[10px] tracking-tight text-neutral-400 uppercase">
                      {role.description}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="h-4 w-4 accent-brand-green"
                    disabled={lockSelfChanges}
                  />
                </label>
              ))}
              {roles.length === 0 && (
                <p className="text-sm text-neutral-400 italic">
                  Belum ada peran yang dikonfigurasi.
                </p>
              )}
            </div>
            {isSelfEditing && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                  isSuperAdmin
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-neutral-200 bg-neutral-50 text-neutral-500"
                }`}
              >
                {isSuperAdmin
                  ? "Mengubah peran sendiri dapat membatasi akses Anda ke fitur admin."
                  : "Anda tidak dapat mengubah peran Anda sendiri."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden justify-end gap-4 border-t border-neutral-200 pt-8 md:flex">
        <Link href="/admin/users">
          <Button variant="outline" size="lg">
            {isDirty ? "Batal" : "Kembali"}
          </Button>
        </Link>
        <Button
          variant="dark"
          size="lg"
          type="submit"
          disabled={isPending || !isDirty}
        >
          {isPending
            ? "Menyimpan..."
            : isDirty
              ? isNew
                ? "Buat Pengguna Baru"
                : "Simpan"
              : isNew
                ? "Buat Pengguna Baru"
                : "Simpan Pengguna"}
        </Button>
      </div>

      {/* Mobile Floating Save Bar */}
      <div
        data-admin-sticky
        className="fixed right-0 bottom-0 left-0 z-40 flex justify-center border-t border-neutral-200 bg-white/80 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      >
        <div className="flex w-full items-center justify-between gap-4 px-4">
          <Link
            href="/admin/users"
            className="flex items-center gap-1 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-700"
          >
            <X size={16} /> {isDirty ? "Batal" : "Kembali"}
          </Link>
          <Button
            variant="dark"
            size="md"
            type="submit"
            disabled={isPending || !isDirty}
            className="shadow-lg shadow-brand-green/20"
          >
            <Save size={16} className="mr-2" />
            {isPending ? "Simpan..." : isNew ? "Buat Pengguna Baru" : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
