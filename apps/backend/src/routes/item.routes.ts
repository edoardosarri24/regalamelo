import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { CreateGiftItemSchema, UpdateGiftItemSchema } from '@gift-list/shared';
import { addItemToList, updateItem, deleteItem } from '../controllers/item.controller';
import { claimItem, unclaimItem } from '../controllers/guest.controller';

const router = Router();

// Guest Claim Routes
router.post('/:id/claim', authenticateJWT, claimItem);
router.post('/:id/unclaim', authenticateJWT, unclaimItem);

// Celebrant Routes
router.post('/list/:listId', authenticateJWT, validateBody(CreateGiftItemSchema), addItemToList);
router.patch('/:id', authenticateJWT, validateBody(UpdateGiftItemSchema), updateItem);
router.delete('/:id', authenticateJWT, deleteItem);

export default router;
