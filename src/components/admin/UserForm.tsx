"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Save, X, Shield, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { ActionState, DBRole, DetailedUser, FormAction } from "@/types";
import { toast } from "sonner";

interface UserFormProps {
  action: FormAction;
  initialData?: DetailedUser;
  roles: DBRole[];
}

export function UserForm({ action, initialData, roles }: UserFormProps) {
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

  // Selected Roles State
  const [selectedRoles, setSelectedRoles] = useState<number[]>(initialData?.roles || []);

  const toggleRole = (roleId: number) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-8 w-full pb-32">
      
      {/* Hidden input for roles */}
      <input type="hidden" name="roles" value={JSON.stringify(selectedRoles)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Basic Info */}
        <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <UserIcon size={18} /> Informasi Akun
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-neutral-700">Username</label>
                        <input 
                            name="username" 
                            defaultValue={initialData?.username} 
                            className="p-2 border rounded" 
                            required 
                        />
                        {state?.error?.username && <p className="text-red-500 text-sm font-bold">{state.error.username[0]}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-neutral-700">Email</label>
                        <input 
                            type="email"
                            name="email" 
                            defaultValue={initialData?.email} 
                            className="p-2 border rounded" 
                            required 
                        />
                        {state?.error?.email && <p className="text-red-500 text-sm font-bold">{state.error.email[0]}</p>}
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-bold text-neutral-700">Password {initialData ? "(Kosongkan jika tidak ingin mengubah)" : ""}</label>
                        <input 
                            type="password"
                            name="password" 
                            className="p-2 border rounded" 
                            required={!initialData}
                            placeholder={initialData ? "••••••••" : "Password minimal 6 karakter"}
                        />
                        {state?.error?.password && <p className="text-red-500 text-sm font-bold">{state.error.password[0]}</p>}
                    </div>

                    <div className="flex items-center gap-2 mt-2 md:col-span-2 p-4 bg-neutral-50 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="isActive" 
                                value="true" 
                                defaultChecked={initialData?.isActive ?? true} 
                                className="w-4 h-4 accent-brand-green" 
                            />
                            <span className="text-sm font-medium text-neutral-700">Akun Aktif (Dapat Login)</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Roles Assignment */}
        <div className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200 h-fit">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Shield size={18} /> Peran (Roles)
                </h2>
                <div className="flex flex-col gap-3">
                    {roles.map((role) => (
                        <label key={role.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedRoles.includes(role.id) 
                            ? "border-brand-green bg-brand-light ring-1 ring-brand-green" 
                            : "border-neutral-200 bg-white hover:bg-neutral-50"
                        }`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${selectedRoles.includes(role.id) ? "text-brand-green" : "text-neutral-700"}`}>
                                    {role.name}
                                </span>
                                <span className="text-[10px] text-neutral-400 uppercase tracking-tight">{role.description}</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectedRoles.includes(role.id)} 
                                onChange={() => toggleRole(role.id)}
                                className="w-4 h-4 accent-brand-green"
                            />
                        </label>
                    ))}
                    {roles.length === 0 && <p className="text-sm text-neutral-400 italic">Belum ada peran yang dikonfigurasi.</p>}
                </div>
            </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden md:flex justify-end gap-4 border-t border-neutral-200 pt-8">
        <Link href="/admin/users">
          <Button variant="outline" size="lg">Batal</Button>
        </Link>
        <Button variant="dark" size="lg" type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Pengguna"}
        </Button>
      </div>

      {/* Mobile Floating Save Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-4 z-40 flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="w-full flex items-center justify-between gap-4 px-4">
            <Link href="/admin/users" className="text-sm font-bold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors">
                <X size={16} /> Batal
            </Link>
            <Button variant="dark" size="lg" type="submit" disabled={isPending} className="shadow-lg shadow-brand-green/20 px-8">
                <Save size={18} className="mr-2" />
                {isPending ? "Simpan..." : "Simpan"}
            </Button>
        </div>
      </div>
    </form>
  );
}
