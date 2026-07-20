const DUPLICATE_MESSAGES: Record<string, string> = {
  portfolios_uq_title: "Judul portofolio sudah digunakan.",
  portfolios_uq_slug: "Slug portofolio sudah digunakan.",
};

export function getPortfolioDuplicateMessage(error: unknown): string | null {
  let current = error;

  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== "object" || current === null) return null;

    const record = current as Record<string, unknown>;
    if (record.code === "23505") {
      return typeof record.constraint === "string"
        ? (DUPLICATE_MESSAGES[record.constraint] ??
            "Data portofolio tersebut sudah digunakan.")
        : "Data portofolio tersebut sudah digunakan.";
    }

    current = record.cause;
  }

  return null;
}
