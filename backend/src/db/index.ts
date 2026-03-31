import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { DATABASE_URL } from "../utils/config";

export const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL })
})