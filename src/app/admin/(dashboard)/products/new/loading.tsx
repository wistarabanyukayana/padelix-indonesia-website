import { FormSkeleton } from "@/components/admin/skeletons/FormSkeleton";

export default function NewProductLoading() {
  return <FormSkeleton fieldSections={[3, 2]} hasMediaGrid />;
}
