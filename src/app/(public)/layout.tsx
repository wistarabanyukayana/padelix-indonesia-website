import { MetaPixel } from "@/components/analytics/MetaPixel";
import { Footer } from "@/components/public/layout/Footer";
import { Header } from "@/components/public/layout/Header";
import { WAButton } from "@/components/ui/WAButton";
import { Suspense } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header reads the pathname (active nav state), so it must live under
          a Suspense boundary; the fallback keeps the bar height stable. */}
      <Suspense
        fallback={
          <div className="sticky top-0 z-50 h-18 w-full border-b border-neutral-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md md:h-20" />
        }
      >
        <Header />
      </Suspense>
      {children}
      <Footer />
      <WAButton />
      <Suspense fallback={null}>
        <MetaPixel />
      </Suspense>
    </>
  );
}
