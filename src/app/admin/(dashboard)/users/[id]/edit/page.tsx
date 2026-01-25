import { updateUser } from "@/actions/users";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { UserForm } from "@/components/admin/users/UserForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { roles, users, usersRoles } from "@/db/schema";
import { getSession, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_USERS);
  if (!allowed) return <AccessDenied />;
  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) notFound();

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const user = userResult[0];
  if (!user) notFound();

  const roleList = await db.select().from(roles);

  const userRolesList = await db
    .select({ roleId: usersRoles.rolesId })
    .from(usersRoles)
    .where(eq(usersRoles.usersId, userId));

  const initialData = {
    ...user,
    roles: userRolesList.map((ur) => ur.roleId),
  };

  const updateUserWithId = updateUser.bind(null, userId);
  const session = await getSession();
  const isSuperAdmin = (session?.user.permissions ?? []).includes(
    PERMISSIONS.MANAGE_USERS,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Edit Pengguna: {user.username}</h1>
        <Link href="/admin/users" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <UserForm
        action={updateUserWithId}
        initialData={initialData}
        roles={roleList}
        currentUserId={session?.user.id ?? null}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
