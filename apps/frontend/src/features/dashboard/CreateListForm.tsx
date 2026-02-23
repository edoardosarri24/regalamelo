import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateGiftListInput, CreateGiftListSchema } from '@gift-list/shared';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import api from '../../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { ImageUploader } from './ImageUploader';
import { Pencil, Trash2 } from 'lucide-react';

export const CreateListForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showImageUploader, setShowImageUploader] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateGiftListInput>({
        resolver: zodResolver(CreateGiftListSchema)
    });

    const onSubmit = async (data: CreateGiftListInput) => {
        setError('');
        try {
            const payload = { ...data, imageUrl };
            const res = await api.post('/lists', payload);
            navigate(`/dashboard/${res.data.slug}`);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to create list');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '48px auto', padding: '0 24px' }}>
            <Helmet>
                <title>Crea Nuova Lista | GiftBox</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <div style={{ marginBottom: '24px' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-primary)' }}>
                    ← Torna alla Dashboard
                </Link>
            </div>

            {showImageUploader ? (
                <div style={{ marginBottom: '32px' }}>
                    <ImageUploader
                        onSave={(url) => { setImageUrl(url); setShowImageUploader(false); }}
                        onCancel={() => setShowImageUploader(false)}
                    />
                </div>
            ) : (
                <Card>
                    <h2>Crea una Nuova Lista Regali</h2>
                    <p style={{ color: 'gray', marginBottom: '24px' }}>Dai un nome alla tua lista (es. "Il mio 30° Compleanno", "Lista Nozze")</p>

                    {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Profilo Lista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textAlign: 'center' }}>Nessuna<br />Foto</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowImageUploader(true)}
                                style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                        {imageUrl && (
                            <button type="button" onClick={() => setImageUrl('')} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontSize: '13px', marginTop: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={14} /> Rimuovi Foto
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Nome Lista"
                            placeholder="es. Il mio fantastico compleanno"
                            {...register('name')}
                            error={errors.name?.message}
                        />
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" isLoading={isSubmitting}>
                                Crea Lista
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};
