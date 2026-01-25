import { updateRole } from "@/actions/roles";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { permissions, roles, rolesPermissions } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_USERS);
  if (!allowed) return <AccessDenied />;
  const { id } = await params;
  const roleId = parseInt(id);
  if (isNaN(roleId)) notFound();

  const roleResult = await db
    .select()
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1);
  const role = roleResult[0];
  if (!role) notFound();

  const permissionList = await db.select().from(permissions);

  const currentPermissions = await db
    .select({ permissionId: rolesPermissions.permissionsId })
    .from(rolesPermissions)
    .where(eq(rolesPermissions.rolesId, roleId));

  const initialData = {
    ...role,
    permissions: currentPermissions.map((cp) => cp.permissionId),
  };

  const updateRoleWithId = updateRole.bind(null, roleId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Edit Peran: {role.name}</h1>
        <Link href="/admin/roles" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <RoleForm
        action={updateRoleWithId}
        initialData={initialData}
        permissions={permissionList}
      />
    </div>
  );
}
