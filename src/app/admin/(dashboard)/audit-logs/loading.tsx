import { ListSkeleton } from "@/components/admin/skeletons/ListSkeleton";

export default function AuditLogsLoading() {
  return (
    <ListSkeleton
      titleWidth="w-52"
      hasAddButton={false}
      columns={[
        { width: "w-12" },
        { width: "w-32" },
        { width: "w-32" },
        { width: "w-24" },
        { width: "w-20" },
        { width: "w-24" },
        { width: "w-16", align: "right" },
      ]}
    />
  );
}
