import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { WishlistProvider } from '@/context/WishlistContext';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import PropertiesPage from '@/pages/PropertiesPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import WishlistPage from '@/pages/WishlistPage';
import ListPropertyPage from '@/pages/ListPropertyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/"            element={<HomePage />} />
                <Route path="/properties"  element={<PropertiesPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/wishlist"    element={
                  <ProtectedRoute><WishlistPage /></ProtectedRoute>
                } />
                <Route path="/dashboard"   element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/list-property" element={
                  <ProtectedRoute allowedRoles={['seller']}><ListPropertyPage /></ProtectedRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="/login"    element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
