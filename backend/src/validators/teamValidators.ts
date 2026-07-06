import { z } from "zod";
import { cuidSchema } from "./common";

export const teamRoleSchema = z.enum(["ADMIN", "EDITOR", "VIEWER"]);

export const inviteMemberBodySchema = z.object({
    email: z.string().trim().email(),
    role: teamRoleSchema.optional(),
});

export const updateMemberRoleBodySchema = z.object({
    role: teamRoleSchema,
});

export const memberIdParamsSchema = z.object({
    memberId: cuidSchema,
});
