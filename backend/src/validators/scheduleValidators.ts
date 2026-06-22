import { z } from "zod";
import { cuidSchema, dateStringSchema } from "./common";

export const schedulePostBodySchema = z.object({
    scheduledAt: dateStringSchema,
    targetIds: z.array(cuidSchema).optional(),
});
