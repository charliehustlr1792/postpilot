import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../lib/db';
import { AppError } from '../lib/AppError';
import { sendTeamInviteEmail } from '../lib/email';
import { TeamRole } from '../generated/prisma';

// Resolves the authenticated workspace owner, or throws.
async function requireOwner(req: Request) {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, 'User not authenticated');
    }
    const owner = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!owner) {
        throw new AppError(404, 'User not found');
    }
    return owner;
}

// GET /api/team — list the owner's team members.
export const getTeamMembers = async (req: Request, res: Response) => {
    const owner = await requireOwner(req);
    const members = await prisma.teamMember.findMany({
        where: { ownerId: owner.id },
        orderBy: { createdAt: 'asc' },
    });
    res.json({ members });
};

// POST /api/team/invite — create a pending member and email the invitation.
export const inviteMember = async (req: Request, res: Response) => {
    const owner = await requireOwner(req);
    const { email, role } = req.body as { email: string; role?: TeamRole };

    // Duplicate (ownerId, email) hits the unique constraint (P2002 → 409).
    const member = await prisma.teamMember.create({
        data: {
            email,
            role: role ?? 'VIEWER',
            ownerId: owner.id,
        },
    });

    const inviterName =
        [owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.email;
    const emailed = await sendTeamInviteEmail({ to: email, role: member.role, inviterName });

    res.status(201).json({ member, emailed });
};

// PATCH /api/team/:memberId — change a member's role.
export const updateMemberRole = async (req: Request, res: Response) => {
    const owner = await requireOwner(req);
    const { memberId } = req.params;
    const { role } = req.body as { role: TeamRole };

    const member = await prisma.teamMember.findFirst({
        where: { id: memberId, ownerId: owner.id },
    });
    if (!member) {
        throw new AppError(404, 'Team member not found');
    }

    const updated = await prisma.teamMember.update({
        where: { id: memberId },
        data: { role },
    });
    res.json({ member: updated });
};

// DELETE /api/team/:memberId — remove a member.
export const removeMember = async (req: Request, res: Response) => {
    const owner = await requireOwner(req);
    const { memberId } = req.params;

    const member = await prisma.teamMember.findFirst({
        where: { id: memberId, ownerId: owner.id },
    });
    if (!member) {
        throw new AppError(404, 'Team member not found');
    }

    await prisma.teamMember.delete({ where: { id: memberId } });
    res.json({ message: 'Team member removed', member });
};
