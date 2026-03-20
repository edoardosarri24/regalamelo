import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import styles from './Auth.module.css';

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setErrorMessage('Token mancante nel link.');
            return;
        }

        const verify = async () => {
            try {
                const res = await api.post('/auth/verify-email', { token });
                login(res.data.token, res.data.user);
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.response?.data?.error?.message || 'Link non valido o scaduto.');
            }
        };

        verify();
    }, [searchParams, login]);

    return (
        <div className={styles.formContainer}>
            <Card>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    {status === 'loading' && <h2>Verifica in corso...</h2>}
                    {status === 'success' && (
                        <>
                            <h2 style={{ color: 'green', marginBottom: '16px' }}>Account Verificato!</h2>
                            <p style={{ marginBottom: '24px' }}>Il tuo indirizzo email è stato confermato con successo.</p>
                            <Button onClick={() => navigate('/dashboard')}>Vai alla Dashboard</Button>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <h2 style={{ color: 'red', marginBottom: '16px' }}>Errore di Verifica</h2>
                            <p style={{ marginBottom: '24px' }}>{errorMessage}</p>
                            <Button onClick={() => navigate('/')}>Torna alla Home</Button>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};
