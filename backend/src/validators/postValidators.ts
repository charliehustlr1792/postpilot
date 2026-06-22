import { z } from "zod";
import {
    cuidSchema,
    dateStringSchema,
    platformSchema,
    positiveIntFromQuery,
    postStatusSchema,
} from "./common";

export const postIdParamsSchema = z.object({
    postId: cuidSchema,
});

export const listPostsQuerySchema = z.object({
    status: postStatusSchema.optional(),
    platform: platformSchema.optional(),
    page: positiveIntFromQuery.optional(),
    limit: positiveIntFromQuery.optional(),
});

export const createPostBodySchema = z.object({
    content: z.string().trim().min(1, "Content is required"),
    images: z.array(z.string()).optional(),
    socialAccountIds: z
        .array(cuidSchema)
        .min(1, "At least one social account is required"),
    scheduledAt: dateStringSchema.optional(),
});

export const updatePostBodySchema = z
    .object({
        content: z.string().trim().min(1).optional(),
        images: z.array(z.string()).optional(),
        // null clears the schedule (back to draft); a date reschedules.
        scheduledAt: dateStringSchema.nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const duplicatePostBodySchema = z.object({
    socialAccountIds: z.array(cuidSchema).optional(),
});
