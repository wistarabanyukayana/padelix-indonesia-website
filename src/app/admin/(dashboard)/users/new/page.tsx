import { createUser } from "@/actions/users";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { UserForm } from "@/components/admin/users/UserForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { roles } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function NewUserPage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_USERS);
  if (!allowed) return <AccessDenied />;
  const roleList = await db.select().from(roles);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Tambah Pengguna Baru</h1>
        <Link href="/admin/users" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <UserForm action={createUser} roles={roleList} />
    </div>
  );
}
