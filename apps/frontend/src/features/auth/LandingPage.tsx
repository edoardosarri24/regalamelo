import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import styles from './Auth.module.css';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageToggle } from '../../components/LanguageToggle';

export const LandingPage = () => {
    const { user, isLoading } = useAuth();
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const location = useLocation();

    if (isLoading) return null; // or a full screen spinner
    if (user) {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo') || '/dashboard';
        return <Navigate to={returnTo} replace />;
    }

    return (
        <div className={styles.landing}>
            <Helmet>
                <title>{t('landingTitle')}</title>
                <meta name="description" content={t('landingSubtitle')} />
            </Helmet>
            <LanguageToggle absolute />
            <h1 className={styles.title}>{t('landingTitle')}</h1>
            <p className={styles.subtitle}>{t('landingSubtitle')}</p>

            {isLogin ? (
                <LoginForm onToggle={() => setIsLogin(false)} />
            ) : (
                <RegisterForm onToggle={() => setIsLogin(true)} />
            )}
        </div>
    );
};
