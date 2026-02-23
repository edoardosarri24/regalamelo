import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { CreateGiftListSchema, GuestAccessSchema, UpdateGiftListSchema, UpdateGuestAccessNameSchema } from '@gift-list/shared';
import {
    getUserDashboardLists,
    createList,
    getListManage,
    deleteList,
    createGuestAccess,
    getListPublic,
    updateList,
    updateListGuestName
} from '../controllers/list.controller';

const router = Router();

// Guest Routes (Now requires User account JWT)
router.post('/:slug/access', authenticateJWT, validateBody(GuestAccessSchema), createGuestAccess);
router.put('/:slug/access', authenticateJWT, validateBody(UpdateGuestAccessNameSchema), updateListGuestName);
router.get('/:slug', authenticateJWT, getListPublic);
// router.get('/:slug/my-claims', authenticateJWT, getMyClaims);

// Celebrant Routes
router.get('/', authenticateJWT, getUserDashboardLists);
router.post('/', authenticateJWT, validateBody(CreateGiftListSchema), createList);
router.get('/:slug/manage', authenticateJWT, getListManage);
router.put('/:slug/manage', authenticateJWT, validateBody(UpdateGiftListSchema), updateList);
router.delete('/:id', authenticateJWT, deleteList);
// router.post('/:id/item', authenticateJWT, validateBody(CreateGiftItemSchema), addItem);

export default router;
