import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <BrowserRouter>
                    <LanguageProvider>
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </LanguageProvider>
                </BrowserRouter>
            </HelmetProvider>
        </QueryClientProvider>
    </React.StrictMode>,
);
