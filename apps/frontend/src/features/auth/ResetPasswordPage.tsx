import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordInput, ResetPasswordSchema } from '@regalamelo/shared';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import api from '../../lib/axios';
import styles from './Auth.module.css';
import { useLanguage } from '../../i18n/LanguageContext';

export const ResetPasswordPage = () => {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const token = searchParams.get('token');

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            token: token || '',
            password: ''
        }
    });

    // Make sure token is set if it changes
    useEffect(() => {
        if (token) {
            setValue('token', token);
        }
    }, [token, setValue]);

    const onSubmit = async (data: ResetPasswordInput) => {
        setServerError('');
        setSuccessMessage('');
        try {
            await api.post('/auth/reset-password', data);
            setSuccessMessage(t('resetPasswordSuccess'));
        } catch (err: any) {
            if (err.response) {
                const message = err.response.data?.error?.message;
                setServerError(message || t('unexpectedError'));
            } else {
                setServerError(t('connectionError'));
            }
        }
    };

    if (!token) {
        return (
            <div className={styles.landing}>
                <div className={styles.formContainer}>
                    <Card>
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                            <h2 style={{ color: 'red', marginBottom: '16px' }}>{t('verificationError')}</h2>
                            <p style={{ marginBottom: '24px' }}>{t('tokenMissing')}</p>
                            <Button onClick={() => navigate('/')}>{t('backToHome')}</Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.landing}>
            <div className={styles.formContainer}>
                <Card>
                    <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>{t('forgotPasswordTitle')}</h2>

                    {successMessage ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '24px', lineHeight: '1.5', color: 'green', fontWeight: '500' }}>
                                {successMessage}
                            </p>
                            <Button onClick={() => navigate('/')} style={{ width: '100%' }}>
                                {t('goToLogin')}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {serverError && <div className={styles.serverError}>{serverError}</div>}

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Input
                                    label={t('newPasswordLabel')}
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    error={errors.password?.message}
                                />

                                <Button type="submit" isLoading={isSubmitting} style={{ width: '100%', marginTop: '16px' }}>
                                    {t('resetPasswordButton')}
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
