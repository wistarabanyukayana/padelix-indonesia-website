import { createRole } from "@/actions/roles";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { permissions } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function NewRolePage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_USERS);
  if (!allowed) return <AccessDenied />;
  const permissionList = await db.select().from(permissions);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Tambah Peran Baru</h1>
        <Link href="/admin/roles" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <RoleForm action={createRole} permissions={permissionList} />
    </div>
  );
}
