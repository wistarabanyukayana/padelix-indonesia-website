"use client";

import { Button } from "@/components/ui/Button";
import { trackMetaEvent } from "@/lib/metaPixel";
import { FormEvent } from "react";

type ProductSearchFormProps = {
  defaultQuery?: string;
};

export function ProductSearchForm({ defaultQuery }: ProductSearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const query = (formData.get("q") as string | null)?.trim() ?? "";
    if (query) {
      trackMetaEvent("Search", { search_string: query });
    }
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        name="q"
        placeholder="Nama produk..."
        defaultValue={defaultQuery}
        className="min-w-0 flex-1 rounded-full bg-neutral-100 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-brand-green"
      />
      <Button type="submit" variant="dark" size="sm">
        Cari
      </Button>
    </form>
  );
}
