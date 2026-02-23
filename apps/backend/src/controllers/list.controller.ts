import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { CreateGiftListInput, ErrorCodes, GuestAccessInput } from '@gift-list/shared';
import crypto from 'crypto';

export const getUserDashboardLists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const ownedLists = await prisma.giftList.findMany({
            where: { userId, deletedAt: null },
            include: { items: { where: { deletedAt: null } } }
        });

        const guestAccesses = await prisma.guestAccess.findMany({
            where: { userId },
            include: {
                list: {
                    include: { items: { where: { deletedAt: null }, include: { claim: true } } }
                }
            }
        });

        const invitedLists = guestAccesses
            .filter(ga => ga.list.deletedAt === null)
            .map(ga => {
                const list = ga.list;
                const publicItems = list.items
                    .map((item: any) => {
                        const isClaimedByMe = item.claim?.guestId === ga.id;
                        return {
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            url: item.url,
                            status: item.status,
                            preference: item.preference,
                            isClaimedByMe
                        };
                    })
                    .filter((item: any) => item.status === 'AVAILABLE' || item.isClaimedByMe);

                return { id: list.id, name: list.name, customName: ga.customName, slug: list.slug, imageUrl: list.imageUrl, items: publicItems };
            });

        res.json({ ownedLists, invitedLists });
    } catch (err) {
        next(err);
    }
};

export const createList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { name, imageUrl } = req.body as CreateGiftListInput;

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;

        // Simple collision approach
        let existing = await prisma.giftList.findUnique({ where: { slug } });
        if (existing) {
            slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
        }

        const list = await prisma.giftList.create({
            data: {
                userId,
                name,
                slug,
                imageUrl: imageUrl || null
            },
        });

        res.json(list);
    } catch (err) {
        next(err);
    }
};

export const getListManage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { slug } = req.params;

        const list = await prisma.giftList.findFirst({
            where: { slug, userId, deletedAt: null },
            include: { items: { where: { deletedAt: null } } }
        });

        if (!list) {
            throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };
        }

        // Surprise Protection: Masking the actual status for the Celebrant
        const maskedItems = list.items.map((item: any) => ({
            ...item,
            status: 'AVAILABLE',
            claim: undefined
        }));

        res.json({ ...list, items: maskedItems });
    } catch (err) {
        next(err);
    }
};

export const updateList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { slug } = req.params;
        const { name, imageUrl } = req.body; // UpdateGiftListInput

        const list = await prisma.giftList.findFirst({
            where: { slug, userId, deletedAt: null }
        });

        if (!list) {
            throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };
        }

        const updatedList = await prisma.giftList.update({
            where: { id: list.id },
            data: {
                name: name !== undefined ? name : list.name,
                imageUrl: imageUrl !== undefined ? imageUrl : list.imageUrl
            }
        });

        res.json(updatedList);
    } catch (err) {
        next(err);
    }
};

export const deleteList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const list = await prisma.giftList.findFirst({ where: { id, userId, deletedAt: null } });
        if (!list) {
            throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };
        }

        // Soft delete
        await prisma.giftList.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

// Guest Actions
export const createGuestAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const userId = (req as any).user.id;
        const { language } = req.body;

        const list = await prisma.giftList.findUnique({ where: { slug, deletedAt: null } });
        if (!list) {
            throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };
        }

        const access = await prisma.guestAccess.upsert({
            where: { listId_userId: { listId: list.id, userId } },
            update: { language },
            create: { listId: list.id, userId, language }
        });

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

export const updateListGuestName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const userId = (req as any).user.id;
        const { customName } = req.body;

        const list = await prisma.giftList.findUnique({ where: { slug, deletedAt: null } });
        if (!list) {
            throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };
        }

        const access = await prisma.guestAccess.update({
            where: { listId_userId: { listId: list.id, userId } },
            data: { customName }
        });

        res.json({ success: true, customName: access.customName });
    } catch (err) {
        next(err);
    }
};

export const getListPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const userId = (req as any).user.id;

        const list = await prisma.giftList.findFirst({
            where: { slug, deletedAt: null },
            include: {
                items: {
                    where: { deletedAt: null },
                    include: {
                        claim: true
                    }
                }
            }
        });

        if (!list) {
            throw { status: 404, code: ErrorCodes.LIST_NOT_FOUND, message: 'List not found' };
        }

        const guestAccess = await prisma.guestAccess.findUnique({
            where: { listId_userId: { listId: list.id, userId } }
        });

        const publicItems = list.items
            .map((item: any) => {
                const isClaimedByMe = guestAccess ? item.claim?.guestId === guestAccess.id : false;
                return {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    url: item.url,
                    status: item.status,
                    preference: item.preference,
                    isClaimedByMe
                };
            })
            // Guest should only see available items or items they claimed themselves
            .filter((item: any) => item.status === 'AVAILABLE' || item.isClaimedByMe);

        res.json({ id: list.id, name: list.name, customName: guestAccess?.customName, slug: list.slug, imageUrl: list.imageUrl, items: publicItems });
    } catch (err) {
        next(err);
    }
};
