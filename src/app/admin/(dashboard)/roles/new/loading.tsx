import { FormSkeleton } from "@/components/admin/skeletons/FormSkeleton";

export default function NewRoleLoading() {
  return <FormSkeleton fieldSections={[1]} hasChecklist />;
}
