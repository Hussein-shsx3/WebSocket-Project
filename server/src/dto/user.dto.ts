import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  status: z.enum(["online", "offline", "away"]).optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export const searchUsersSchema = z.object({
  query: z.string().min(1),
  limit: z.string().optional(),
});

export type SearchUsersDTO = z.infer<typeof searchUsersSchema>;
