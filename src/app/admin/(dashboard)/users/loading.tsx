import { ListSkeleton } from "@/components/admin/skeletons/ListSkeleton";

export default function UsersLoading() {
  return (
    <ListSkeleton
      titleWidth="w-52"
      columns={[
        { width: "w-32" },
        { width: "w-40" },
        { width: "w-24" },
        { width: "w-20", align: "center" },
        { width: "w-24" },
        { width: "w-16", align: "right" },
      ]}
    />
  );
}
