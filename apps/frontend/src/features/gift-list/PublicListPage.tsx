import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/Input';
import api from '../../lib/axios';
import { GiftListDTO } from '@gift-list/shared';
import { GiftCard } from './GiftCard';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../../components/Button';

export const PublicListPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const { language } = useLanguage();
    const queryClient = useQueryClient();
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const { data: list, isLoading, error } = useQuery({
        queryKey: ['public-list', slug],
        queryFn: async () => {
            const { data } = await api.get<GiftListDTO>(`/lists/${slug}`);
            return data;
        },
        retry: false
    });

    useEffect(() => {
        if (list && slug) {
            api.post(`/lists/${slug}/access`, { language }).catch(console.error);
            if (!editNameValue) {
                setEditNameValue(list.customName || list.name);
            }
        }
    }, [list, slug, language]);

    const updateNameMutation = useMutation({
        mutationFn: (customName: string) => api.put(`/lists/${slug}/access`, { customName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-list', slug] });
            setIsEditingName(false);
        }
    });

    const claimMutation = useMutation({
        mutationFn: (itemId: string) => api.post(`/items/${itemId}/claim`),
        onMutate: (itemId: string) => setLoadingItemId(itemId),
        onSettled: () => {
            setLoadingItemId(null);
            queryClient.invalidateQueries({ queryKey: ['public-list', slug] });
        }
    });

    const unclaimMutation = useMutation({
        mutationFn: (itemId: string) => api.post(`/items/${itemId}/unclaim`),
        onMutate: (itemId: string) => setLoadingItemId(itemId),
        onSettled: () => {
            setLoadingItemId(null);
            queryClient.invalidateQueries({ queryKey: ['public-list', slug] });
        }
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div style={{ padding: '48px', textAlign: 'center' }}>Caricamento Lista...</div>;

    // If unauthorized, guest doesn't have a session, redirect to login
    if (error && (error as any).response?.status === 401) {
        return <Navigate to={`/?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (!list) return <div style={{ padding: '48px', textAlign: 'center' }}>Lista non trovata.</div>;

    const { t } = useLanguage();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            {list && (
                <Helmet>
                    <title>{list.customName || list.name} | Giftlyst</title>
                    <meta name="description" content={`Scopri la lista regali di ${list.customName || list.name} su Giftlyst.`} />
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": list.customName || list.name,
                            "description": `Lista regali di ${list.customName || list.name}`,
                            "itemListElement": list.items.map((item: any, index: number) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "name": item.name,
                                "description": item.description || "",
                                "url": item.url || ""
                            }))
                        })}
                    </script>
                </Helmet>
            )}
            <div style={{ marginBottom: '24px' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} />
                        {t('backToDashboard')}
                    </Button>
                </Link>
            </div>
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                {list.imageUrl && (
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 24px', border: '4px solid var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <img src={list.imageUrl} alt={list.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
                {isEditingName ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <Input
                            autoFocus
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateNameMutation.mutate(editNameValue)}
                        />
                        <Button onClick={() => updateNameMutation.mutate(editNameValue)} variant="primary">{t('save')}</Button>
                        <Button onClick={() => setIsEditingName(false)} variant="outline">Annulla</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {list.customName || list.name}
                        </h1>
                        <Button variant="outline" onClick={() => setIsEditingName(true)} style={{ marginTop: '8px', padding: '4px 12px', fontSize: '14px' }}>
                            {t('editListLocalName')}
                        </Button>
                    </div>
                )}
                {list.customName && !isEditingName && <p style={{ fontSize: '14px', color: 'gray', marginTop: '4px' }}>Originale: {list.name}</p>}

                <p style={{ color: 'gray', marginTop: '16px' }}>Il regalo selezionato non sarà più visibile dagli altri invitati.</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleCopy}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text)', fontSize: '14px', whiteSpace: 'nowrap' }}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Link Copiato!' : 'Copia Link Lista'}
                    </button>
                </div>
            </div>

            {list.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', borderRadius: '8px' }}>
                    Nessun regalo è stato ancora aggiunto a questa lista. Torna a controllare più tardi!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {list.items.map((item: any) => (
                        <GiftCard
                            key={item.id}
                            item={item}
                            onClaim={(id: string) => claimMutation.mutate(id)}
                            onUnclaim={(id: string) => unclaimMutation.mutate(id)}
                            isLoading={loadingItemId === item.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
