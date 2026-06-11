import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordInput, ForgotPasswordSchema } from '@regalamelo/shared';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { useLanguage } from '../../i18n/LanguageContext';

export const ForgotPasswordPage = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema)
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        setServerError('');
        setSuccessMessage('');
        try {
            // Pass the current app language as Accept-Language header
            await api.post('/auth/forgot-password', data, {
                headers: {
                    'Accept-Language': language
                }
            });
            setSuccessMessage(t('resetLinkSent'));
        } catch (err: any) {
            if (err.response) {
                const message = err.response.data?.error?.message;
                setServerError(message || t('unexpectedError'));
            } else {
                setServerError(t('connectionError'));
            }
        }
    };

    return (
        <div className={styles.landing}>
            <div className={styles.formContainer}>
                <Card>
                    <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>{t('forgotPasswordTitle')}</h2>
                    
                    {successMessage ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '24px', lineHeight: '1.5', color: 'var(--color-text)' }}>
                                {successMessage}
                            </p>
                            <Button onClick={() => navigate('/')} style={{ width: '100%' }}>
                                {t('goToLogin')}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
                                {t('forgotPasswordDesc')}
                            </p>
                            
                            {serverError && <div className={styles.serverError}>{serverError}</div>}

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Input
                                    label={t('emailLabel')}
                                    type="email"
                                    placeholder="festeggiato@esempio.com"
                                    {...register('email')}
                                    error={errors.email?.message}
                                />

                                <Button type="submit" isLoading={isSubmitting} style={{ width: '100%', marginTop: '8px' }}>
                                    {t('sendResetLinkButton')}
                                </Button>
                            </form>

                            <div className={styles.toggle}>
                                <button className={styles.toggleLink} onClick={() => navigate('/')}>
                                    &larr; {t('back')}
                                </button>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};
