import { db } from "@/lib/db";
import { permissions } from "@/db/schema";
import { createRole } from "@/actions/roles";
import { RoleForm } from "@/components/admin/RoleForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function NewRolePage() {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
  const permissionList = await db.select().from(permissions);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Tambah Peran Baru</h1>
        <Link href="/admin/roles" className="hidden md:block">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>

      <RoleForm action={createRole} permissions={permissionList} />
    </div>
  );
}
