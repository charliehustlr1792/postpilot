import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
    getTeamMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
} from '../controllers/teamController';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimit';
import {
    inviteMemberBodySchema,
    updateMemberRoleBodySchema,
    memberIdParamsSchema,
} from '../validators/teamValidators';

const router = Router();

router.get('/team', requireAuth(), getTeamMembers);
router.post('/team/invite', requireAuth(), writeLimiter, validate({ body: inviteMemberBodySchema }), inviteMember);
router.patch('/team/:memberId', requireAuth(), validate({ params: memberIdParamsSchema, body: updateMemberRoleBodySchema }), updateMemberRole);
router.delete('/team/:memberId', requireAuth(), validate({ params: memberIdParamsSchema }), removeMember);

export default router;
