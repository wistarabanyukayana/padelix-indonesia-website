import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { createUser } from "@/actions/users";
import { UserForm } from "@/components/admin/UserForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function NewUserPage() {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
  const roleList = await db.select().from(roles);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Tambah Pengguna Baru</h1>
        <Link href="/admin/users" className="hidden md:block">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>

      <UserForm action={createUser} roles={roleList} />
    </div>
  );
}
