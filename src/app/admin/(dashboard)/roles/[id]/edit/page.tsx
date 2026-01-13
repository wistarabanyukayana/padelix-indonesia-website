import { db } from "@/lib/db";
import { roles, permissions, rolesPermissions } from "@/db/schema";
import { updateRole } from "@/actions/roles";
import { RoleForm } from "@/components/admin/RoleForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
  const { id } = await params;
  const roleId = parseInt(id);
  if (isNaN(roleId)) notFound();

  const roleResult = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  const role = roleResult[0];
  if (!role) notFound();

  const permissionList = await db.select().from(permissions);
  
  const currentPermissions = await db
    .select({ permissionId: rolesPermissions.permissionsId })
    .from(rolesPermissions)
    .where(eq(rolesPermissions.rolesId, roleId));

  const initialData = {
    ...role,
    permissions: currentPermissions.map(cp => cp.permissionId),
  };

  const updateRoleWithId = updateRole.bind(null, roleId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Edit Peran: {role.name}</h1>
        <Link href="/admin/roles" className="hidden md:block">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>

      <RoleForm action={updateRoleWithId} initialData={initialData} permissions={permissionList} />
    </div>
  );
}
