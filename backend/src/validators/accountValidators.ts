import { z } from "zod";
import { cuidSchema, platformSchema } from "./common";

export const connectAccountBodySchema = z.object({
    platform: platformSchema,
    username: z.string().trim().min(1, "Username is required"),
    displayName: z.string().trim().min(1).optional(),
    profileImage: z.string().url().optional(),
    accessToken: z.string().min(1, "Access token is required"),
    refreshToken: z.string().min(1).optional(),
});

export const accountIdParamsSchema = z.object({
    accountId: cuidSchema,
});
