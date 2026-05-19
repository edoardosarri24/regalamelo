import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateGiftItemInput, CreateGiftItemSchema, GiftListDTO } from '@regalamelo/shared';
import api from '../../lib/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Trash2, Copy, Check, Pencil } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { useLanguage } from '../../i18n/LanguageContext';

const ManageItemCard = ({ item, slug, onDelete }: { item: any; slug: string; onDelete: () => void }) => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editImage, setEditImage] = useState<string | null>(item.imageUrl || null);
    const [isEditingImage, setIsEditingImage] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<CreateGiftItemInput>({
        resolver: zodResolver(CreateGiftItemSchema),
        defaultValues: {
            name: item.name,
            description: item.description || '',
            url: item.url || '',
            preference: item.preference,
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: (data: any) => {
            const payload = { ...data };
            if (editImage !== undefined) {
                payload.imageUrl = editImage;
            }
            return api.patch(`/items/${item.id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manage-list', slug] });
            setIsEditing(false);
        }
    });

    if (isEditing) {
        return (
            <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isEditingImage ? (
                    <ImageUploader
                        shape="rect"
                        aspectRatio={1}
                        title={t('editGift')}
                        onSave={(url) => {
                            setEditImage(url);
                            setIsEditingImage(false);
                        }}
                        onCancel={() => setIsEditingImage(false)}
                    />
                ) : (
                    <form onSubmit={handleSubmit((data) => updateItemMutation.mutate(data))}>
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {editImage ? (
                                    <img src={editImage} alt="Regalo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textAlign: 'center' }}>{t('noPhoto')}</span>
                                )}
                            </div>
                            <Button type="button" variant="outline" onClick={() => setIsEditingImage(true)}>
                                {editImage ? t('changePhoto') : t('addPhoto')}
                            </Button>
                            {editImage && (
                                <Button type="button" variant="secondary" onClick={() => setEditImage(null)}>
                                    {t('removePhoto')}
                                </Button>
                            )}
                        </div>

                        <Input label={t('nameLabel')} placeholder="es. Nintendo Switch" {...register('name')} error={errors.name?.message} />
                        <Input label={t('descriptionLabel')} placeholder="Dettagli specifici" {...register('description')} error={errors.description?.message} />
                        <Input label={t('urlLabel')} placeholder="https://..." {...register('url')} error={errors.url?.message} />

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>{t('preferenceLabel')}</label>
                            <select {...register('preference')} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
                                <option value="LOW">{t('low')}</option>
                                <option value="MEDIUM">{t('medium')}</option>
                                <option value="HIGH">{t('high')}</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button type="submit" isLoading={updateItemMutation.isPending}>{t('saveChanges')}</Button>
                            <Button type="button" variant="ghost" onClick={() => {
                                setIsEditing(false);
                                setEditImage(item.imageUrl || null);
                            }}>{t('cancel')}</Button>
                        </div>
                    </form>
                )}
            </Card>
        );
    }

    return (
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textAlign: 'center' }}>No foto</span>
                    )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ margin: 0, wordBreak: 'break-word' }}>{item.name} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'gray' }}>({item.preference === 'LOW' ? t('low') : item.preference === 'MEDIUM' ? t('medium') : t('high')})</span></h4>
                    {item.description && <p style={{ fontSize: '14px', marginTop: '4px', wordBreak: 'break-word' }}>{item.description}</p>}
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', wordBreak: 'break-all', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('urlLabel')}</a>}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                    onClick={() => setIsEditing(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px' }}
                >
                    <Pencil size={20} />
                </button>
                <button
                    onClick={() => { if (window.confirm(t('confirmDelete'))) onDelete() }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </Card>
    );
};

export const ManageListPage = () => {
    const { t } = useLanguage();
    const { slug } = useParams<{ slug: string }>();
    const queryClient = useQueryClient();
    const [showAddForm, setShowAddForm] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);

    // Add Item Image State
    const [newItemImage, setNewItemImage] = useState<string | null>(null);
    const [isAddingItemImage, setIsAddingItemImage] = useState(false);

    const { data: list, isLoading } = useQuery({
        queryKey: ['manage-list', slug],
        queryFn: async () => {
            const { data } = await api.get<GiftListDTO>(`/lists/${slug}/manage`);
            return data;
        },
    });

    const updateListMutation = useMutation({
        mutationFn: (data: { imageUrl: string }) => api.put(`/lists/${slug}/manage`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manage-list', slug] });
            setIsEditingImage(false);
        }
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateGiftItemInput>({
        resolver: zodResolver(CreateGiftItemSchema),
        defaultValues: { preference: 'MEDIUM' }
    });

    const addItemMutation = useMutation({
        mutationFn: (newItem: CreateGiftItemInput) => api.post(`/items/list/${list?.id}`, newItem),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manage-list', slug] });
            reset();
            setNewItemImage(null);
            setShowAddForm(false);
        }
    });

    const onSubmitNewItem = handleSubmit((data: any) => {
        const payload = { ...data };
        if (newItemImage) {
            payload.imageUrl = newItemImage;
        }
        addItemMutation.mutate(payload);
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => api.delete(`/items/${itemId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manage-list', slug] });
        }
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/lists/${list?.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div style={{ padding: '24px' }}>Caricamento...</div>;
    if (!list) return <div style={{ padding: '24px' }}>Lista non trovata</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <Helmet>
                <title>{t('manage')} {list.name} | Regalamelo</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <div style={{ marginBottom: '24px' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-primary)' }}>
                    {t('backToDashboard')}
                </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', flex: '1 1 min-content' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {list.imageUrl ? (
                                <img src={list.imageUrl} alt={list.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{t('noPhoto')}</span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsEditingImage(!isEditingImage)}
                            style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        >
                            <Pencil size={14} />
                        </button>
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h1 style={{ marginTop: 0, wordBreak: 'break-word' }}>{list.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <a href={`${window.location.origin}/lists/${list.slug}`} target="_blank" rel="noreferrer" style={{ color: 'gray', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' }}>
                                Condividi lista: {window.location.origin}/lists/{list.slug}
                            </a>
                            <button
                                onClick={handleCopy}
                                title={t('copyLink')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: '4px' }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} style={{ whiteSpace: 'nowrap' }}>
                    {showAddForm ? t('cancel') : t('addGift')}
                </Button>
            </div>

            {isEditingImage && (
                <div style={{ marginBottom: '32px' }}>
                    <ImageUploader
                        onSave={(imageUrl) => updateListMutation.mutate({ imageUrl })}
                        onCancel={() => setIsEditingImage(false)}
                        isLoading={updateListMutation.isPending}
                    />
                </div>
            )}

            {showAddForm && (
                <Card style={{ marginBottom: '32px' }}>
                    <h3>{t('addGift')}</h3>

                    {isAddingItemImage ? (
                        <div style={{ marginTop: '16px' }}>
                            <ImageUploader
                                shape="rect"
                                aspectRatio={1}
                                title={t('addGift')}
                                onSave={(url) => {
                                    setNewItemImage(url);
                                    setIsAddingItemImage(false);
                                }}
                                onCancel={() => setIsAddingItemImage(false)}
                            />
                        </div>
                    ) : (
                        <form onSubmit={onSubmitNewItem} style={{ marginTop: '16px' }}>
                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {newItemImage ? (
                                        <img src={newItemImage} alt="Regalo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textAlign: 'center' }}>{t('noPhoto')}</span>
                                    )}
                                </div>
                                <Button type="button" variant="outline" onClick={() => setIsAddingItemImage(true)}>
                                    {newItemImage ? t('changePhoto') : t('addPhoto')}
                                </Button>
                                {newItemImage && (
                                    <Button type="button" variant="secondary" onClick={() => setNewItemImage(null)}>
                                        {t('removePhoto')}
                                    </Button>
                                )}
                            </div>

                            <Input label={t('nameLabel')} placeholder="es. Nintendo Switch" {...register('name')} error={errors.name?.message} />
                            <Input label={t('descriptionLabel')} placeholder="Dettagli specifici" {...register('description')} error={errors.description?.message} />
                            <Input label={t('urlLabel')} placeholder="https://..." {...register('url')} error={errors.url?.message} />

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>{t('preferenceLabel')}</label>
                                <select {...register('preference')} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
                                    <option value="LOW">{t('low')}</option>
                                    <option value="MEDIUM">{t('medium')}</option>
                                    <option value="HIGH">{t('high')}</option>
                                </select>
                            </div>

                            <Button type="submit" isLoading={isSubmitting || addItemMutation.isPending}>{t('saveChanges')}</Button>
                        </form>
                    )}
                </Card>
            )}

            <div>
                <h3>{t('gifts')}</h3>
                {list.items.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '32px' }}>
                        <p>{t('noGiftsAdded')}</p>
                        <Button variant="outline" onClick={() => setShowAddForm(true)} style={{ marginTop: '16px' }}>{t('addFirstGift')}</Button>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {list.items.map((item: any) => (
                            <ManageItemCard
                                key={item.id}
                                item={item}
                                slug={slug!}
                                onDelete={() => deleteItemMutation.mutate(item.id as string)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

