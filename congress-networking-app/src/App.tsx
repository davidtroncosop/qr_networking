import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ROUTES } from './utils/constants';

// Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { VerifyMagicLinkPage } from './pages/VerifyMagicLinkPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EventDetailPage } from './pages/EventDetailPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/verify" element={<VerifyMagicLinkPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile/setup" 
              element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/events/create" 
              element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/events/:eventId" 
              element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
