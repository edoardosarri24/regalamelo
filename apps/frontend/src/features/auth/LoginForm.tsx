import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginUserInput, LoginUserSchema } from '@regalamelo/shared';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Auth.module.css';
import { useLanguage } from '../../i18n/LanguageContext';
import { getSafeReturnTo } from '../../lib/returnTo';

export const LoginForm = ({ onToggle }: { onToggle: () => void }) => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginUserInput>({
        resolver: zodResolver(LoginUserSchema)
    });

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const onSubmit = async (data: LoginUserInput) => {
        setServerError('');
        setSuccessMessage('');
        setShowResend(false);
        try {
            const res = await api.post('/auth/login', data);
            login(res.data.token, res.data.user);
            // Go back to the page that required login (e.g. a shared list link).
            // Only allow internal paths to avoid open redirects.
            navigate(getSafeReturnTo(location.search), { replace: true });
        } catch (err: any) {
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.error?.message;

                if (status === 401) {
                    setServerError(t('invalidCredentials'));
                } else if (status === 403 && err.response.data?.error?.code === 'AUTH_EMAIL_NOT_VERIFIED') {
                    setServerError(t('emailNotVerified'));
                    setUnverifiedEmail(data.email);
                    setShowResend(true);
                } else if (status >= 400 && status < 500) {
                    setServerError(message ? t(message as any) : t('invalidData'));
                } else {
                    setServerError(t('serverError'));
                }
            } else if (err.request) {
                setServerError(t('connectionError'));
            } else {
                setServerError(t('unexpectedError'));
            }
        }
    };

    const handleResendEmail = async () => {
        setIsResending(true);
        setServerError('');
        setSuccessMessage('');
        try {
            await api.post('/auth/resend-verification', { email: unverifiedEmail });
            setSuccessMessage(t('verificationEmailResent'));
            setResendCooldown(30);
        } catch (err: any) {
            setServerError(err.response?.data?.error?.message ? t(err.response.data.error.message as any) : t('serverError'));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <Card>
                <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('welcomeBack')}</h2>
                {serverError && <div className={styles.serverError}>{serverError}</div>}
                {successMessage && <div style={{ textAlign: 'center', padding: '16px' }}>
                    <p style={{ color: 'green', marginBottom: '16px' }}>{successMessage}</p>
                </div>}
                {showResend && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <Button 
                            variant="outline" 
                            onClick={handleResendEmail} 
                            isLoading={isResending}
                            disabled={isResending || resendCooldown > 0}
                            style={{ width: '100%', opacity: resendCooldown > 0 ? 0.6 : 1 }}
                        >
                            {isResending ? t('resending') : t('resendVerificationEmail')}
                            {resendCooldown > 0 && ` (${resendCooldown})`}
                        </Button>
                    </div>
                )}

                <form id="login-form" name="login" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
                    <Input
                        id="login-email"
                        label={t('emailLabel')}
                        type="email"
                        placeholder="festeggiato@esempio.com"
                        {...register('email')}
                        autoComplete="username"
                        error={errors.email?.message ? t(errors.email.message as any) : undefined}
                    />
                    <Input
                        id="login-password"
                        label={t('passwordLabel')}
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        autoComplete="current-password"
                        error={errors.password?.message ? t(errors.password.message as any) : undefined}
                    />

                    <div style={{ textAlign: 'right', marginBottom: '24px', marginTop: '-8px' }}>
                        <button
                            type="button"
                            className={styles.toggleLink}
                            onClick={() => navigate('/auth/forgot-password')}
                            style={{ fontSize: '13px', border: 'none', padding: 0 }}
                        >
                            {t('forgotPasswordLink')}
                        </button>
                    </div>

                    <Button type="submit" isLoading={isSubmitting} style={{ width: '100%' }}>
                        {t('loginButton')}
                    </Button>
                </form>

                <div className={styles.toggle}>
                    {t('noAccount')}
                    <button className={styles.toggleLink} onClick={onToggle}>{t('createOne')}</button>
                </div>
            </Card>
        </div>
    );
};
