import { ListSkeleton } from "@/components/admin/skeletons/ListSkeleton";

export default function PortfoliosLoading() {
  return (
    <ListSkeleton
      titleWidth="w-48"
      columns={[
        { width: "w-16", thumbnail: true },
        { width: "w-40" },
        { width: "w-28" },
        { width: "w-20", align: "center" },
        { width: "w-24" },
        { width: "w-16", align: "right" },
      ]}
    />
  );
}
