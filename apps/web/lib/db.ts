import { prisma } from "@repo/db";

const prismaSingleton = ()=> {
    return prisma;
}

const globalForPrisma = globalThis as unknown as {
    prismaClient: ReturnType<typeof prismaSingleton> | undefined;
}

const prismaClient = globalForPrisma.prismaClient ?? prismaSingleton();

if(process.env.NODE_ENV!=="production"){
    globalForPrisma.prismaClient = prismaClient;
}

export default prismaClient;