import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { GiftListDTO } from '@gift-list/shared';
import { GiftCard } from './GiftCard';
import { GuestAccessPage } from './GuestAccessPage';
import { Copy, Check } from 'lucide-react';

export const PublicListPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const queryClient = useQueryClient();
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { data: list, isLoading, error } = useQuery({
        queryKey: ['public-list', slug],
        queryFn: async () => {
            const { data } = await api.get<GiftListDTO>(`/lists/${slug}`);
            return data;
        },
        retry: false
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

    // If unauthorized, guest doesn't have a session, show Access page
    if (error && (error as any).response?.status === 401) {
        return <GuestAccessPage />;
    }

    if (!list) return <div style={{ padding: '48px', textAlign: 'center' }}>Lista non trovata.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                {list.imageUrl && (
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 24px', border: '4px solid var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <img src={list.imageUrl} alt={list.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', wordBreak: 'break-word' }}>{list.name}</h1>
                <p style={{ color: 'gray', marginTop: '8px' }}>Il regalo selezionato non sarà più visibile dagli altri invitati.</p>
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
