import { z } from "zod";
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        offline: "offline";
        online: "online";
        away: "away";
    }>>;
}, z.core.$strip>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export declare const searchUsersSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SearchUsersDTO = z.infer<typeof searchUsersSchema>;
//# sourceMappingURL=user.dto.d.ts.map