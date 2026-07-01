import { ListSkeleton } from "@/components/admin/skeletons/ListSkeleton";

export default function RolesLoading() {
  return (
    <ListSkeleton
      titleWidth="w-48"
      columns={[
        { width: "w-16" },
        { width: "w-32" },
        { width: "w-40" },
        { width: "w-24" },
        { width: "w-16", align: "right" },
      ]}
    />
  );
}
