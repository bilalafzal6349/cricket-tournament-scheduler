import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { TournamentsPage } from '@/pages/TournamentsPage';
import { CreateTournamentPage } from '@/pages/CreateTournamentPage';
import { TournamentDetailPage } from '@/pages/TournamentDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tournaments">
          <Route index element={<TournamentsPage />} />
          <Route 
            path="new" 
            element={
              <ProtectedRoute requireAdmin>
                <CreateTournamentPage />
              </ProtectedRoute>
            } 
          />
          <Route path=":id" element={<TournamentDetailPage />} />
        </Route>
        {/* Redirect old routes or handle 404 */}
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
