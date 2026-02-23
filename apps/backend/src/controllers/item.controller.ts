import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { CreateGiftItemInput, UpdateGiftItemInput, ErrorCodes } from '@gift-list/shared';
import { sendClaimedItemRemovalNotification } from '../services/email.service';

export const addItemToList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const listId = req.params.listId;
        const userId = (req as any).user.id;
        const data = req.body as CreateGiftItemInput;

        const list = await prisma.giftList.findFirst({ where: { id: listId, userId, deletedAt: null } });
        if (!list) throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };

        const item = await prisma.giftItem.create({
            data: {
                listId: list.id,
                name: data.name,
                description: data.description || null,
                url: data.url || null,
                imageUrl: data.imageUrl || null,
                preference: data.preference,
            }
        });

        res.json(item);
    } catch (err) {
        next(err);
    }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemId = req.params.id;
        const userId = (req as any).user.id;
        const data = req.body as UpdateGiftItemInput;

        const item = await prisma.giftItem.findFirst({
            where: { id: itemId, deletedAt: null },
            include: { list: true }
        });

        if (!item || item.list.userId !== userId) {
            throw { status: 404, code: ErrorCodes.ITEM_NOT_FOUND, message: 'Item not found' };
        }

        const updated = await prisma.giftItem.update({
            where: { id: itemId },
            data: {
                name: data.name,
                description: data.description,
                url: data.url,
                imageUrl: data.imageUrl,
                preference: data.preference,
            }
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemId = req.params.id;
        const userId = (req as any).user.id;

        const item = await prisma.giftItem.findFirst({
            where: { id: itemId, deletedAt: null },
            include: {
                list: true,
                claim: {
                    include: { guest: true }
                }
            }
        });

        if (!item || item.list.userId !== userId) {
            throw { status: 404, code: ErrorCodes.ITEM_NOT_FOUND, message: 'Item not found' };
        }

        if (item.status === 'CLAIMED' && item.claim) {
            // Asynchronously send notification to avoid blocking the response
            sendClaimedItemRemovalNotification(
                item.claim.guest.email,
                item.name,
                item.list.name,
                item.claim.guest.language
            );
        }

        await prisma.giftItem.update({
            where: { id: itemId },
            data: { deletedAt: new Date() }
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
