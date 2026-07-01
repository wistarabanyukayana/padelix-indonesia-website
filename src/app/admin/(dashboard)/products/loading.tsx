import { ListSkeleton } from "@/components/admin/skeletons/ListSkeleton";

export default function ProductsLoading() {
  return (
    <ListSkeleton
      titleWidth="w-40"
      columns={[
        { width: "w-16", thumbnail: true },
        { width: "w-40" },
        { width: "w-28" },
        { width: "w-20", align: "center" },
        { width: "w-24" },
        { width: "w-20" },
        { width: "w-16", align: "right" },
      ]}
    />
  );
}
