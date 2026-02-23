import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { ErrorCodes } from '@gift-list/shared';

export const claimItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemId = req.params.id;
        const userId = (req as any).user.id;

        // Transaction to prevent race conditions
        await prisma.$transaction(async (tx) => {
            // 1. Lock the specific Item row
            const itemRow = await tx.$queryRaw<any[]>`SELECT status FROM "GiftItem" WHERE id = ${itemId} FOR UPDATE`;

            if (!itemRow || itemRow.length === 0) {
                throw { status: 404, code: ErrorCodes.ITEM_NOT_FOUND, message: 'Item not found' };
            }

            const item = await tx.giftItem.findUnique({ where: { id: itemId } });
            if (!item || item.deletedAt) throw { status: 404, code: ErrorCodes.ITEM_NOT_FOUND, message: 'Item not found' };
            if (item.status === 'CLAIMED') throw { status: 409, code: ErrorCodes.ITEM_ALREADY_CLAIMED, message: 'Item already claimed' };

            const guestAccess = await tx.guestAccess.findUnique({
                where: { listId_userId: { listId: item.listId, userId } }
            });
            if (!guestAccess) throw { status: 403, code: 'NOT_A_GUEST', message: 'You must access the list first' };

            // Make the claim
            await tx.guestClaim.create({
                data: { itemId, guestId: guestAccess.id }
            });

            // Update item status
            await tx.giftItem.update({
                where: { id: itemId },
                data: { status: 'CLAIMED' }
            });
        });

        res.json({ success: true, status: 'CLAIMED' });
    } catch (err) {
        next(err);
    }
};

export const unclaimItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemId = req.params.id;
        const userId = (req as any).user.id;

        const claim = await prisma.guestClaim.findUnique({
            where: { itemId },
            include: { guest: true }
        });

        if (!claim) {
            throw { status: 400, code: ErrorCodes.VALIDATION_ERROR, message: 'Item is not claimed' };
        }

        if (claim.guest.userId !== userId) {
            throw { status: 403, code: ErrorCodes.ITEM_NOT_CLAIMED_BY_YOU, message: 'Not claimed by you' };
        }

        await prisma.$transaction(async (tx) => {
            await tx.guestClaim.delete({ where: { itemId } });
            await tx.giftItem.update({
                where: { id: itemId },
                data: { status: 'AVAILABLE' }
            });
        });

        res.json({ success: true, status: 'AVAILABLE' });
    } catch (err) {
        next(err);
    }
};
