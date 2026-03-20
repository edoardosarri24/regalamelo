import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/auth/LandingPage';
import { VerifyEmailPage } from './features/auth/VerifyEmailPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CreateListForm } from './features/dashboard/CreateListForm';
import { ManageListPage } from './features/dashboard/ManageListPage';
import { PublicListPage } from './features/gift-list/PublicListPage';

function App() {
    return (
        <div className="app-container">
            <Routes>
                {/* Public / Celebrant Auth */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Celebrant Protected */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/new" element={<CreateListForm />} />
                <Route path="/dashboard/:slug" element={<ManageListPage />} />

                {/* Guest Public */}
                <Route path="/lists/:slug" element={<PublicListPage />} />
            </Routes>
        </div>
    );
}

export default App;
