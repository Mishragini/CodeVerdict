import "dotenv/config";
import { defineConfig } from "prisma/config";

// #region agent log
fetch("http://127.0.0.1:7478/ingest/3317dfb2-4f7c-4aa6-b3fc-61ac4c8d3c36", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8cde4c" },
  body: JSON.stringify({
    sessionId: "8cde4c",
    runId: "pre-fix",
    hypothesisId: "A",
    location: "backend/prisma.config.ts:6",
    message: "Prisma config loaded (cwd + env presence)",
    data: {
      cwd: process.cwd(),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.slice(0, 24) ?? null,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

