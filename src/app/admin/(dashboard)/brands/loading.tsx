import { ListSkeleton } from "@/components/admin/skeletons/ListSkeleton";

export default function BrandsLoading() {
  return (
    <ListSkeleton
      titleWidth="w-48"
      columns={[
        { width: "w-16", thumbnail: true },
        { width: "w-40" },
        { width: "w-32" },
        { width: "w-16", align: "right" },
      ]}
    />
  );
}
