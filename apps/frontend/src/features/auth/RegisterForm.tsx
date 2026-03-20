import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterUserInput, RegisterUserSchema } from '@gift-list/shared';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import api from '../../lib/axios';
import styles from './Auth.module.css';
import { useLanguage } from '../../i18n/LanguageContext';

export const RegisterForm = ({ onToggle }: { onToggle: () => void }) => {
    const { t } = useLanguage();
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterUserInput>({
        resolver: zodResolver(RegisterUserSchema)
    });

    const onSubmit = async (data: RegisterUserInput) => {
        setServerError('');
        setSuccessMessage('');
        try {
            const res = await api.post('/auth/register', data);
            setSuccessMessage(res.data.message || 'Registrazione completata. Controlla la tua email per verificare l\'account!');
        } catch (err: any) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                const status = err.response.status;
                const message = err.response.data?.error?.message;

                if (status === 409) {
                    setServerError('Questa email è già registrata. Prova ad accedere o usa un altro indirizzo.');
                } else if (status >= 400 && status < 500) {
                    setServerError(message || 'I dati inseriti non sono validi. Controlla e riprova.');
                } else {
                    setServerError('Il server ha riscontrato un problema. Riprova più tardi.');
                }
            } else if (err.request) {
                // The request was made but no response was received
                setServerError('Impossibile contattare il server. Controlla la tua connessione.');
            } else {
                setServerError('Si è verificato un errore imprevisto. Riprova.');
            }
        }
    };

    return (
        <div className={styles.formContainer}>
            <Card>
                <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('createAccount')}</h2>
                {serverError && <div className={styles.serverError}>{serverError}</div>}
                {successMessage ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                        <p style={{ color: 'green', marginBottom: '16px' }}>{successMessage}</p>
                        <Button onClick={onToggle}>Vai al Login</Button>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label={t('emailLabel')}
                        type="email"
                        placeholder="festeggiato@esempio.com"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <Input
                        label={t('passwordLabel')}
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        error={errors.password?.message}
                    />

                    <Button type="submit" isLoading={isSubmitting} style={{ width: '100%' }}>
                        {t('registerButton')}
                    </Button>
                </form>

                <div className={styles.toggle}>
                    {t('alreadyHaveAccount')}
                    <button className={styles.toggleLink} onClick={onToggle}>{t('loginNow')}</button>
                </div>
                    </>
                )}
            </Card>
        </div>
    );
};
