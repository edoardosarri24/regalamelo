import { useAuth } from '../../hooks/useAuth';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { GiftListDTO } from '@gift-list/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useLanguage } from '../../i18n/LanguageContext';

export const DashboardPage = () => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const queryClient = useQueryClient();
    const [joinInput, setJoinInput] = useState('');
    const [joinError, setJoinError] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError('');
        if (!joinInput.trim()) return;

        setIsJoining(true);
        try {
            // Extract slug if a full URL is pasted
            let slug = joinInput.trim();
            if (slug.includes('/lists/')) {
                const parts = slug.split('/lists/');
                slug = parts[parts.length - 1].split('/')[0].split('?')[0];
            }

            await api.post(`/lists/${slug}/access`, { language });
            setJoinInput('');
            queryClient.invalidateQueries({ queryKey: ['dashboard-lists'] });
        } catch (err: any) {
            setJoinError(t('joinListError'));
        } finally {
            setIsJoining(false);
        }
    };

    const updateNameMutation = useMutation({
        mutationFn: ({ slug, customName }: { slug: string, customName: string }) =>
            api.put(`/lists/${slug}/access`, { customName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-lists'] });
        }
    });

    const EditingCard = ({ list }: { list: GiftListDTO }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(list.customName || list.name);

        const handleSave = () => {
            updateNameMutation.mutate({ slug: list.slug, customName: editValue });
            setIsEditing(false);
        };

        return (
            <Card key={list.id}>
                {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <Input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={(e) => {
                                // Save on blur if clicked outside buttons
                                if (!e.relatedTarget) handleSave();
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <Button onClick={handleSave} variant="primary" style={{ padding: '0 8px' }}>{t('save')}</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>{list.customName || list.name}</h3>
                        <Button variant="outline" onClick={() => setIsEditing(true)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                            {t('editListLocalName')}
                        </Button>
                    </div>
                )}
                {list.customName && <p style={{ fontSize: '12px', color: 'gray', marginTop: '4px' }}>Original: {list.name}</p>}

                <p style={{ marginTop: '8px', color: 'gray' }}>{t('giftsCount')}: {list.items.length}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <Link to={`/lists/${list.slug}`} style={{ flex: 1, textDecoration: 'none' }}>
                        <Button variant="outline" style={{ width: '100%' }}>{t('view')}</Button>
                    </Link>
                </div>
            </Card>
        );
    };

    if (!user) return <Navigate to="/" replace />;

    const { data: lists, isLoading } = useQuery({
        queryKey: ['dashboard-lists'],
        queryFn: async () => {
            const { data } = await api.get<{ ownedLists: GiftListDTO[], invitedLists: GiftListDTO[] }>('/lists');
            return data;
        },
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <Helmet>
                <title>{t('dashboardTitle')} | Regalamelo</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>{t('dashboardTitle')}</h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button
                        variant="outline"
                        onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
                        style={{ padding: '0 12px', minWidth: '40px' }}
                    >
                        {language === 'it' ? 'EN' : 'IT'}
                    </Button>
                    <Button onClick={logout} variant="outline">{t('logout')}</Button>
                </div>
            </div>

            <div style={{ 
                marginBottom: '40px', 
                display: 'flex', 
                gap: '24px', 
                flexWrap: 'wrap',
                backgroundColor: 'var(--color-surface)',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)',
                alignItems: 'center'
            }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>{t('createNewList')}</h3>
                    <Link to="/dashboard/new" style={{ textDecoration: 'none', display: 'block' }}>
                        <Button variant="primary" style={{ width: '100%' }}>+ {t('createNewList')}</Button>
                    </Link>
                </div>
                
                <div style={{ width: '1px', height: '60px', backgroundColor: 'var(--color-border)', margin: '0 12px', display: 'none' }} className="desktop-divider"></div>

                <div style={{ flex: 2, minWidth: '300px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>{t('joinListButton')}</h3>
                    <form onSubmit={handleJoin} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                                placeholder={t('joinListInput')}
                                error={joinError}
                                style={{ margin: 0 }}
                            />
                        </div>
                        <Button type="submit" variant="outline" isLoading={isJoining} style={{ height: '45px' }}>
                            {t('joinListButton')}
                        </Button>
                    </form>
                </div>
            </div>

            {isLoading ? (
                <div>{t('loading')}</div>
            ) : lists && (lists.ownedLists.length > 0 || lists.invitedLists.length > 0) ? (
                <div>
                    {lists.ownedLists.length > 0 && (
                        <div style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
                                <div style={{ width: '4px', height: '24px', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{t('myLists')}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
                                {lists.ownedLists.map(list => (
                                    <Card key={list.id}>
                                        <h3>{list.name}</h3>
                                        <p style={{ marginTop: '8px', color: 'gray' }}>{t('giftsCount')}: {list.items.length}</p>
                                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                            <Link to={`/dashboard/${list.slug}`} style={{ flex: 1, textDecoration: 'none' }}>
                                                <Button variant="outline" style={{ width: '100%' }}>{t('manage')}</Button>
                                            </Link>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {lists.invitedLists.length > 0 && (
                        <div style={{ marginBottom: '48px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
                                <div style={{ width: '4px', height: '24px', backgroundColor: 'var(--color-secondary)', borderRadius: '4px' }}></div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{t('invitedLists')}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
                                {lists.invitedLists.map(list => (
                                    <EditingCard key={list.id} list={list} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '48px 24px', width: '100%' }}>
                    <h3>{t('noListsTitle')}</h3>
                    <p style={{ color: 'gray', marginTop: '8px', marginBottom: '16px' }}>{t('noListsMsg')}</p>
                    <Link to="/dashboard/new" style={{ textDecoration: 'none' }}>
                        <Button variant="primary">{t('createFirstList')}</Button>
                    </Link>
                </Card>
            )}
        </div>
    );
};
