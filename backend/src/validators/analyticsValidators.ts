import { z } from "zod";
import { cuidSchema, positiveIntFromQuery } from "./common";

export const analyticsOverviewQuerySchema = z.object({
    days: positiveIntFromQuery.optional(),
});

export const analyticsTrendsQuerySchema = z.object({
    period: z.enum(["daily", "weekly", "monthly"]).optional(),
    days: positiveIntFromQuery.optional(),
});

export const targetIdParamsSchema = z.object({
    targetId: cuidSchema,
});

// Metrics are non-negative integers; all optional so partial syncs are allowed.
const metricSchema = z.coerce.number().int().nonnegative().optional();

export const recordAnalyticsBodySchema = z.object({
    impressions: metricSchema,
    likes: metricSchema,
    shares: metricSchema,
    comments: metricSchema,
    clicks: metricSchema,
    reach: metricSchema,
    saves: metricSchema,
});
