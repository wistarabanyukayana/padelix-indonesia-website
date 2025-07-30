import { SectionRenderer } from "@/components/general/SectionRenderer";
import { getHomePage } from "@/data/loaders";
import { notFound } from "next/navigation";

export async function loadData() {
  const data = await getHomePage();

  if (!data) notFound();

  return data;
}

export default async function Home() {
  const { data } = await loadData();
  const sections = data?.sections || [];

  return <SectionRenderer sections={sections} />;
}
