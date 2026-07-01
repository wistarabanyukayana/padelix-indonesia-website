import { FormSkeleton } from "@/components/admin/skeletons/FormSkeleton";

export default function EditRoleLoading() {
  return <FormSkeleton fieldSections={[1]} hasChecklist />;
}
