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
    const { t, language } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const location = useLocation();

    if (isLoading) return null;
    if (user) {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo') || '/dashboard';
        return <Navigate to={returnTo} replace />;
    }

    const baseUrl = 'https://regalamelo.edoardosarri.com';
    const currentUrl = `${baseUrl}${location.pathname}`;

    return (
        <div className={styles.landing}>
            <Helmet>
                <title>{t('landingTitle')}</title>
                <meta name="description" content={t('landingSubtitle')} />
                <link rel="canonical" href={currentUrl} />
                
                {/* Language Alternates */}
                <link rel="alternate" hrefLang="it" href={`${baseUrl}/?lang=it`} />
                <link rel="alternate" hrefLang="en" href={`${baseUrl}/?lang=en`} />
                <link rel="alternate" hrefLang="x-default" href={baseUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={t('landingTitle')} />
                <meta property="og:description" content={t('landingSubtitle')} />
                <meta property="og:image" content={`${baseUrl}/og-image.png`} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={currentUrl} />
                <meta name="twitter:title" content={t('landingTitle')} />
                <meta name="twitter:description" content={t('landingSubtitle')} />
                <meta name="twitter:image" content={`${baseUrl}/og-image.png`} />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Regalamelo",
                        "operatingSystem": "Web",
                        "applicationCategory": "UtilityApplication",
                        "description": t('landingSubtitle'),
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "EUR"
                        }
                    })}
                </script>
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
