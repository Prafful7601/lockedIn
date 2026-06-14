/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Turso/libSQL adapter ships native bits — don't let Next try to bundle
  // them; load them from node_modules at runtime instead.
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "libsql"],
};

module.exports = nextConfig;
