import { getMedias } from "@/actions/media";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { MediaLibrary } from "@/components/admin/medias/MediaLibrary";
import { PERMISSIONS } from "@/config/permissions";
import { hasPermission } from "@/lib/auth";

export const metadata = {
  title: "Media Library | Admin Panel",
};

export default async function MediaManagerPage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_MEDIA);
  if (!allowed) return <AccessDenied />;

  const medias = await getMedias();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="h2 text-neutral-900">Universal Media Library</h1>
        <p className="text-sm text-neutral-500">
          Kelola semua aset gambar, video, dan dokumen di satu tempat.
        </p>
      </div>

      <MediaLibrary initialMedias={medias} />
    </div>
  );
}
