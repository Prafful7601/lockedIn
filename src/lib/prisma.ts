import { PrismaClient } from "@prisma/client";

// One PrismaClient, reused across hot-reloads in dev.
//
// DB selection is automatic:
//   • TURSO_DATABASE_URL set  → use the Turso (libSQL) adapter  [production]
//   • otherwise               → plain local SQLite file          [local dev]
//
// So `npm run dev` keeps using prisma/dev.db with zero config, and Vercel uses
// Turso just by having the env vars present.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma(): PrismaClient {
  // Desktop (Electron) build always uses the fast local SQLite file, never Turso.
  const tursoUrl =
    process.env.LOCKEDIN_DESKTOP === "1" ? undefined : process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    // Loaded lazily so local dev never touches the libSQL packages.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
