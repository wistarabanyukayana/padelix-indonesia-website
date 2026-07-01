import { FormSkeleton } from "@/components/admin/skeletons/FormSkeleton";

export default function NewUserLoading() {
  return <FormSkeleton fieldSections={[2, 1]} />;
}
