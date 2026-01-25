import { useEffect, useMemo, useRef, useState } from "react";

const serializeForm = (form: HTMLFormElement) => {
  const formData = new FormData(form);
  const entries: Record<string, string[]> = {};

  formData.forEach((value, key) => {
    const normalized = typeof value === "string" ? value : value.name;
    if (!entries[key]) entries[key] = [];
    entries[key].push(normalized);
  });

  const normalized = Object.keys(entries)
    .sort()
    .map((key) => [key, entries[key].slice().sort()]);

  return JSON.stringify(normalized);
};

type UseFormDirtyOptions = {
  resetDeps?: unknown[];
  watchDeps?: unknown[];
  resetKey?: string;
  watchKey?: string;
};

export const useFormDirty = (
  formRef: React.RefObject<HTMLFormElement | null>,
  {
    resetDeps = [],
    watchDeps = [],
    resetKey: resetKeyOverride,
    watchKey: watchKeyOverride,
  }: UseFormDirtyOptions = {},
) => {
  const [isDirty, setIsDirty] = useState(false);
  const initialSnapshotRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const resetKey = useMemo(
    () => resetKeyOverride ?? JSON.stringify(resetDeps),
    [resetKeyOverride, resetDeps],
  );
  const watchKey = useMemo(
    () => watchKeyOverride ?? JSON.stringify(watchDeps),
    [watchKeyOverride, watchDeps],
  );

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const frame = requestAnimationFrame(() => {
      initialSnapshotRef.current = serializeForm(form);
      isDirtyRef.current = false;
      setIsDirty(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [formRef, resetKey]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handler = () => {
      if (isDirtyRef.current) return;
      const snapshot = serializeForm(form);
      const initial = initialSnapshotRef.current;
      if (initial === null) {
        initialSnapshotRef.current = snapshot;
        isDirtyRef.current = false;
        setIsDirty(false);
        return;
      }
      if (initial !== snapshot) {
        isDirtyRef.current = true;
        setIsDirty(true);
      }
    };

    handler();
    form.addEventListener("input", handler);
    form.addEventListener("change", handler);

    return () => {
      form.removeEventListener("input", handler);
      form.removeEventListener("change", handler);
    };
  }, [formRef, watchKey]);

  return { isDirty };
};
