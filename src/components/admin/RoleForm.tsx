"use client";

import { useState, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, ShieldCheck, Key, X } from "lucide-react";
import { toast } from "sonner";
import { ActionState, DBPermission, DBRole, FormAction } from "@/types";
import Link from "next/link";

interface RoleFormProps {
  action: FormAction;
  initialData?: DBRole & { permissions: number[] };
  permissions: DBPermission[];
}

export function RoleForm({ action, initialData, permissions }: RoleFormProps) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);
  
  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(initialData?.permissions || []);

  const togglePermission = (permId: number) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-8 w-full pb-32">
      
      {/* Hidden input for permissions */}
      <input type="hidden" name="permissions" value={JSON.stringify(selectedPermissions)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Role Details */}
        <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <ShieldCheck size={18} /> Detail Peran
                </h2>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-neutral-700">Nama Peran</label>
                        <input 
                            name="name" 
                            defaultValue={initialData?.name} 
                            className="p-2.5 border rounded text-sm md:text-base" 
                            required 
                            placeholder="Contoh: Editor Konten"
                        />
                        {state?.error?.name && <p className="text-red-500 text-sm font-bold">{state.error.name[0]}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-neutral-700">Deskripsi</label>
                        <textarea 
                            name="description" 
                            defaultValue={initialData?.description ?? ""} 
                            className="p-2.5 border rounded h-24 text-sm md:text-base" 
                            placeholder="Jelaskan apa yang bisa dilakukan oleh peran ini..."
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Permissions Assignment */}
        <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200 h-fit">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Key size={18} /> Izin Akses (Permissions)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((perm) => (
                        <label key={perm.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                            selectedPermissions.includes(perm.id) 
                            ? "border-brand-green bg-brand-light ring-1 ring-brand-green" 
                            : "border-neutral-200 bg-white hover:bg-neutral-50"
                        }`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black tracking-tight ${selectedPermissions.includes(perm.id) ? "text-brand-green" : "text-neutral-700"}`}>
                                    {perm.slug}
                                </span>
                                <span className="text-xs text-neutral-400 mt-0.5">{perm.description}</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectedPermissions.includes(perm.id)} 
                                onChange={() => togglePermission(perm.id)}
                                className="w-5 h-5 accent-brand-green"
                            />
                        </label>
                    ))}
                    {permissions.length === 0 && <p className="text-sm text-neutral-400 italic">Belum ada izin yang terdaftar di sistem.</p>}
                </div>
            </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden md:flex justify-end gap-4 border-t border-neutral-200 pt-8">
        <Link href="/admin/roles">
          <Button variant="outline" size="lg">Batal</Button>
        </Link>
        <Button variant="dark" size="lg" type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Peran"}
        </Button>
      </div>

      {/* Mobile Floating Save Bar */}
      <div data-admin-sticky className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-4 z-40 flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="w-full flex items-center justify-between gap-4 px-4">
            <Link href="/admin/roles" className="text-sm font-bold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors">
                <X size={16} /> Batal
            </Link>
            <Button variant="dark" size="md" type="submit" disabled={isPending} className="shadow-lg shadow-brand-green/20">
                <Save size={16} className="mr-2" />
                {isPending ? "Simpan..." : "Simpan"}
            </Button>
        </div>
      </div>
    </form>
  );
}
