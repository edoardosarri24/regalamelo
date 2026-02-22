import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { GiftListDTO } from '@gift-list/shared';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

export const DashboardPage = () => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    if (!user) return <Navigate to="/" replace />;

    const { data: lists, isLoading } = useQuery({
        queryKey: ['celebrant-lists'],
        queryFn: async () => {
            const { data } = await api.get<GiftListDTO[]>('/lists');
            return data;
        },
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
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

            <div style={{ marginBottom: '24px' }}>
                <Link to="/dashboard/new" style={{ textDecoration: 'none' }}>
                    <Button variant="primary">{t('createNewList')}</Button>
                </Link>
            </div>

            {isLoading ? (
                <div>{t('loading')}</div>
            ) : lists && lists.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
                    {lists.map(list => (
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
