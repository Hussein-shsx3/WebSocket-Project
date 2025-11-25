import { PrismaClient } from "@prisma/client";
declare global {
    var prisma: PrismaClient | undefined;
}
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const connectDB: () => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
export declare const checkDBHealth: () => Promise<boolean>;
export default prisma;
//# sourceMappingURL=db.d.ts.map