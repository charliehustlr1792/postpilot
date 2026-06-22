import { z } from "zod";
import { Platform, PostStatus } from "../types/enums";

// Shared building blocks reused across validator schemas.

export const platformSchema = z.nativeEnum(Platform);
export const postStatusSchema = z.nativeEnum(PostStatus);

// Accepts any string that Date can parse (ISO 8601 with or without offset),
// matching how the controllers consume scheduledAt via `new Date(value)`.
export const dateStringSchema = z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Must be a valid date string",
    });

export const cuidSchema = z.string().min(1, "Required");

// Pagination / range query coercion: query values arrive as strings.
export const positiveIntFromQuery = z.coerce
    .number()
    .int()
    .positive();
