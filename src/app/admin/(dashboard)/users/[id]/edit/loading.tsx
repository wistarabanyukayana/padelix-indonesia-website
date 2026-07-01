import { FormSkeleton } from "@/components/admin/skeletons/FormSkeleton";

export default function EditUserLoading() {
  return <FormSkeleton fieldSections={[2, 1]} />;
}
