import { SectionRenderer } from "@/components/general/SectionRenderer";
import { getHomePage } from "@/data/loaders";
import { notFound } from "next/navigation";

async function getData() {
  const data = await getHomePage();

  if (!data) notFound();

  return { ...data.data };
}

export default async function Home() {
  const data = await getData();
  const sections = data?.sections || [];

  return <SectionRenderer sections={sections} />;
}
