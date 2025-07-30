"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function StimulatedProgress() {
  const [value, setValue] = useState(10);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setValue((v) => (v >= 90 ? 90 : v + 10));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section h-full">
      <Progress value={value} className="w-1/2" />
      <span className="mt-4 text-muted-foreground">Memuat produk...</span>
    </section>
  );
}
