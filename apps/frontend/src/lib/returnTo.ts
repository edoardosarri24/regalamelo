/**
 * Reads the `returnTo` query param and returns it only if it is a safe internal path.
 * Rejects absolute / protocol-relative URLs (`//evil.com`, `/\evil.com`) to avoid open redirects.
 */
export const getSafeReturnTo = (search: string, fallback = '/dashboard'): string => {
    const returnTo = new URLSearchParams(search).get('returnTo');
    if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) {
        return fallback;
    }
    return returnTo;
};
