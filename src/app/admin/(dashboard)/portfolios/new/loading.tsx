import { FormSkeleton } from "@/components/admin/skeletons/FormSkeleton";

export default function NewPortfolioLoading() {
  return <FormSkeleton fieldSections={[3]} hasMediaGrid />;
}
