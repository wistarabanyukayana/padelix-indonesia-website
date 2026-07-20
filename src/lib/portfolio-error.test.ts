import assert from "node:assert/strict";
import test from "node:test";

import { getPortfolioDuplicateMessage } from "./portfolio-error";

test("maps direct and wrapped PostgreSQL portfolio duplicate errors", () => {
  assert.equal(
    getPortfolioDuplicateMessage({
      code: "23505",
      constraint: "portfolios_uq_title",
    }),
    "Judul portofolio sudah digunakan.",
  );
  assert.equal(
    getPortfolioDuplicateMessage(
      new Error("Query failed", {
        cause: { code: "23505", constraint: "portfolios_uq_slug" },
      }),
    ),
    "Slug portofolio sudah digunakan.",
  );
  assert.equal(
    getPortfolioDuplicateMessage({
      code: "23505",
      constraint: "some_other_constraint",
    }),
    "Data portofolio tersebut sudah digunakan.",
  );
  assert.equal(getPortfolioDuplicateMessage(new Error("network error")), null);
});
