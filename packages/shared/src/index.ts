export * from './validations';

// Common Types for DTOs as defined in the specs

export enum ItemStatus {
    AVAILABLE = 'AVAILABLE',
    CLAIMED = 'CLAIMED',
}

export enum PreferenceLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export interface UserDTO {
    id: string;
    email: string;
}

export interface AuthResponseDTO {
    token: string;
    user: UserDTO;
}

export interface GiftItemDTO {
    id: string;
    name: string;
    description?: string | null;
    url?: string | null;
    status: ItemStatus;
    preference: PreferenceLevel;
    isClaimedByMe: boolean;
}

export interface GiftListDTO {
    id: string;
    name: string;
    customName?: string | null;
    slug: string;
    imageUrl?: string | null;
    items: GiftItemDTO[];
}

export interface ErrorResponseDTO {
    error: {
        code: string;
        message: string;
    };
}

export const ErrorCodes = {
    AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
    AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
    AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    LIST_NOT_FOUND: 'LIST_NOT_FOUND',
    ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
    ITEM_ALREADY_CLAIMED: 'ITEM_ALREADY_CLAIMED',
    ITEM_NOT_CLAIMED_BY_YOU: 'ITEM_NOT_CLAIMED_BY_YOU',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
