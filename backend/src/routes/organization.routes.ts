import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';
import { authenticate, requireOrgMember, requireOrgRole } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
  updateMemberRoleSchema,
} from '../validators/organization.validator.js';
import { OrgRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrganizationSchema), organizationController.createOrganization);
router.get('/current', requireOrgMember, organizationController.getCurrentOrganization);
router.patch('/current', requireOrgMember, requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), validate(updateOrganizationSchema), organizationController.updateCurrentOrganization);
router.get('/members', requireOrgMember, organizationController.getMembers);
router.post('/invitations', requireOrgMember, requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), validate(inviteMemberSchema), organizationController.inviteMember);
router.post('/invitations/accept', validate(acceptInvitationSchema), organizationController.acceptInvitation);
router.patch('/members/:id', requireOrgMember, requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), validate(updateMemberRoleSchema), organizationController.updateMemberRole);
router.delete('/members/:id', requireOrgMember, requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), organizationController.removeMember);

export default router;

