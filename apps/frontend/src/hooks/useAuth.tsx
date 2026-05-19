import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDTO } from '@regalamelo/shared';
import api, { setAuthToken } from '../lib/axios';

interface AuthContextType {
    user: UserDTO | null;
    login: (token: string, user: UserDTO) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Attempt to silently refresh token on mount
        const checkAuth = async () => {
            try {
                const { data } = await api.post('/auth/refresh');
                setAuthToken(data.token);
                // We technically need the user data as well, backend refresh might send user, or we decode JWT
                // For simplicity, assuming refresh returns token and we can decode id/email or backend sends user.
                // Let's decode or fetch profile. Assuming /auth/me exists, or we just rely on token decode.
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                setUser({ id: payload.id, email: payload.email });
            } catch (err) {
                setAuthToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();

        const handleAuthError = () => {
            setUser(null);
            setAuthToken(null);
        };
        window.addEventListener('auth-error', handleAuthError);
        return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    const login = (token: string, u: UserDTO) => {
        setAuthToken(token);
        setUser(u);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.warn('Backend logout failed', err);
        } finally {
            setAuthToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
