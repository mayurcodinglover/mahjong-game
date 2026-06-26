import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { loadEnvFile } from "node:process";

const globalForPrisma = globalThis;

if (!process.env.DATABASE_URL) {
  loadEnvFile();
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
