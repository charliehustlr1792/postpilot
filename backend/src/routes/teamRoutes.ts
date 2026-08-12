import { Router } from 'express';
import { requireApiAuth } from '../middleware/requireApiAuth';
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

router.get('/team', requireApiAuth, getTeamMembers);
router.post('/team/invite', requireApiAuth, writeLimiter, validate({ body: inviteMemberBodySchema }), inviteMember);
router.patch('/team/:memberId', requireApiAuth, validate({ params: memberIdParamsSchema, body: updateMemberRoleBodySchema }), updateMemberRole);
router.delete('/team/:memberId', requireApiAuth, validate({ params: memberIdParamsSchema }), removeMember);

export default router;
