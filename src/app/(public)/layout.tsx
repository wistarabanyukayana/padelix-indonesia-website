import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WAButton } from "@/components/ui/WAButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <WAButton />
    </>
  );
}
