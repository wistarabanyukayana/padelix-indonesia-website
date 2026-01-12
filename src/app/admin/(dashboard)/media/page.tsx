import { getMedias } from "@/actions/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media Library | Admin Panel",
};

export default async function MediaManagerPage() {
  await checkPermission(PERMISSIONS.MANAGE_MEDIA);
  
  const medias = await getMedias();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="h2 text-neutral-900">Universal Media Library</h1>
        <p className="text-neutral-500 text-sm">Kelola semua aset gambar, video, dan dokumen di satu tempat.</p>
      </div>

      <MediaLibrary initialMedias={medias} />
    </div>
  );
}
