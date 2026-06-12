"use client";

import { Button } from "@/components/ui/Button";
import { trackMetaEvent } from "@/lib/metaPixel";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

const DEBOUNCE_MS = 350;

type ProductSearchFormProps = {
  defaultQuery?: string;
};

export function ProductSearchForm({ defaultQuery }: ProductSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultQuery ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync the input when the query changes from outside (e.g. a filter link
  // clears all params) — but never while the user is typing
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const applyQuery = (query: string) => {
    // Preserve active category/brand filters
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(
        params.size > 0 ? `/products?${params.toString()}` : "/products",
        { scroll: false },
      );
    });
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => applyQuery(next.trim()),
      DEBOUNCE_MS,
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = value.trim();
    applyQuery(query);
    if (query) {
      trackMetaEvent("Search", { search_string: query });
    }
  };

  return (
    <form role="search" className="flex gap-2" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="search"
        name="q"
        placeholder="Nama produk..."
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        enterKeyHint="search"
        aria-label="Cari produk"
        className="min-w-0 flex-1 rounded-xl bg-neutral-100 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-brand-green"
      />
      <Button
        type="submit"
        variant="dark"
        size="sm"
        disabled={isPending}
        aria-busy={isPending}
      >
        Cari
      </Button>
    </form>
  );
}
