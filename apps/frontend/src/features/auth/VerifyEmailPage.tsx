import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import styles from './Auth.module.css';
import { useLanguage } from '../../i18n/LanguageContext';

export const VerifyEmailPage = () => {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setErrorMessage(t('tokenMissing'));
            return;
        }

        const verify = async () => {
            try {
                const res = await api.post('/auth/verify-email', { token });
                login(res.data.token, res.data.user);
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.response?.data?.error?.message || t('invalidOrExpiredLink'));
            }
        };

        verify();
    }, [searchParams, login]);

    return (
        <div className={styles.formContainer}>
            <Card>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    {status === 'loading' && <h2>{t('verifying')}</h2>}
                    {status === 'success' && (
                        <>
                            <h2 style={{ color: 'green', marginBottom: '16px' }}>{t('accountVerified')}</h2>
                            <p style={{ marginBottom: '24px' }}>{t('emailVerifiedSuccess')}</p>
                            <Button onClick={() => navigate('/dashboard')}>{t('backToDashboard')}</Button>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <h2 style={{ color: 'red', marginBottom: '16px' }}>{t('verificationError')}</h2>
                            <p style={{ marginBottom: '24px' }}>{errorMessage}</p>
                            <Button onClick={() => navigate('/')}>{t('backToHome')}</Button>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};
