"use client";

import { useFormDirty } from "@/components/admin/general/useFormDirty";
import { useNewItemToast } from "@/components/admin/general/useNewItemToast";
import { Button } from "@/components/ui/Button";
import { ActionState, DBPermission, DBRole, FormAction } from "@/types";
import { Key, Save, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface RoleFormProps {
  action: FormAction;
  initialData?: DBRole & { permissions: number[] };
  permissions: DBPermission[];
}

export function RoleForm({ action, initialData, permissions }: RoleFormProps) {
  const isNew = !initialData?.id;
  const [state, formAction, isPending] = useActionState(
    action,
    {} as ActionState,
  );
  const { hasNew, clearNewParam } = useNewItemToast("Role berhasil dibuat");
  const lastToastRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  useEffect(() => {
    if (isPending) lastToastRef.current = null;
  }, [isPending]);

  useEffect(() => {
    if (!state?.message) return;
    const toastKey = `${state.success}-${state.message}`;
    if (lastToastRef.current === toastKey) return;
    lastToastRef.current = toastKey;
    if (state.success) {
      toast.success(state.message);
      if (hasNew) clearNewParam();
    } else {
      toast.error(state.message);
    }
  }, [clearNewParam, hasNew, state]);

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    initialData?.permissions || [],
  );

  const { isDirty } = useFormDirty(formRef, {
    resetDeps: [initialData],
    watchDeps: [selectedPermissions],
  });

  const togglePermission = (permId: number) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-8 pb-32"
    >
      {/* Hidden input for permissions */}
      <input
        type="hidden"
        name="permissions"
        value={JSON.stringify(selectedPermissions)}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Col: Role Details */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-bold text-neutral-900">
              <ShieldCheck size={18} /> Detail Peran
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-700">
                  Nama Peran
                </label>
                <input
                  name="name"
                  defaultValue={initialData?.name}
                  className="rounded border p-2.5 text-sm md:text-base"
                  required
                  placeholder="Contoh: Editor Konten"
                />
                {state?.error?.name && (
                  <p className="text-sm font-bold text-red-500">
                    {state.error.name[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-700">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  defaultValue={initialData?.description ?? ""}
                  className="h-24 rounded border p-2.5 text-sm md:text-base"
                  placeholder="Jelaskan apa yang bisa dilakukan oleh peran ini..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Permissions Assignment */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="h-fit rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-bold text-neutral-900">
              <Key size={18} /> Izin Akses (Permissions)
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {permissions.map((perm) => (
                <label
                  key={perm.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${
                    selectedPermissions.includes(perm.id)
                      ? "border-brand-green bg-brand-light ring-1 ring-brand-green"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-black tracking-tight ${selectedPermissions.includes(perm.id) ? "text-brand-green" : "text-neutral-700"}`}
                    >
                      {perm.slug}
                    </span>
                    <span className="mt-0.5 text-xs text-neutral-400">
                      {perm.description}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="h-5 w-5 accent-brand-green"
                  />
                </label>
              ))}
              {permissions.length === 0 && (
                <p className="text-sm text-neutral-400 italic">
                  Belum ada izin yang terdaftar di sistem.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden justify-end gap-4 border-t border-neutral-200 pt-8 md:flex">
        <Link href="/admin/roles">
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
                ? "Buat Peran Baru"
                : "Simpan"
              : isNew
                ? "Buat Peran Baru"
                : "Simpan Peran"}
        </Button>
      </div>

      {/* Mobile Floating Save Bar */}
      <div
        data-admin-sticky
        className="fixed right-0 bottom-0 left-0 z-40 flex justify-center border-t border-neutral-200 bg-white/80 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      >
        <div className="flex w-full items-center justify-between gap-4 px-4">
          <Link
            href="/admin/roles"
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
            {isPending ? "Simpan..." : isNew ? "Buat Peran Baru" : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
