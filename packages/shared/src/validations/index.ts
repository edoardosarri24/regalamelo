import { z } from 'zod';

export const PasswordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]|[0-9]/, 'Password must contain at least one number or special character');

export const RegisterUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: PasswordSchema,
});

export const LoginUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const CreateGiftListSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
    imageUrl: z.string().optional().nullable().or(z.literal('')),
});

export const UpdateGiftListSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters').optional(),
    imageUrl: z.string().optional().nullable().or(z.literal('')),
});

export const CreateGiftItemSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
    description: z.string().max(200, 'Description cannot exceed 200 characters').optional().nullable(),
    url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
    imageUrl: z.string().optional().nullable().or(z.literal('')),
    preference: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const UpdateGiftItemSchema = CreateGiftItemSchema.partial();

export const GuestAccessSchema = z.object({
    language: z.string().min(2).max(5).default('en'),
});

export const UpdateGuestAccessNameSchema = z.object({
    customName: z.string().min(1, 'Name must be at least 1 character').max(50, 'Name cannot exceed 50 characters'),
});

// Infer types
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type CreateGiftListInput = z.infer<typeof CreateGiftListSchema>;
export type UpdateGiftListInput = z.infer<typeof UpdateGiftListSchema>;
export type CreateGiftItemInput = z.infer<typeof CreateGiftItemSchema>;
export type UpdateGiftItemInput = z.infer<typeof UpdateGiftItemSchema>;
export type GuestAccessInput = z.infer<typeof GuestAccessSchema>;
export type UpdateGuestAccessNameInput = z.infer<typeof UpdateGuestAccessNameSchema>;
