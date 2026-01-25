import { Footer } from "@/components/public/layout/Footer";
import { Header } from "@/components/public/layout/Header";
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
