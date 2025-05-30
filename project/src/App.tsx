import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Authors from './pages/Authors';
import Users from './pages/Users';
import Transmissions from './pages/Transmissions';
import Halls from './pages/Halls';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth(); // Проверяем статус аутентификации
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};

function App() {
  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="authors" element={<Authors />} />
          <Route path="users" element={<Users />} />
          <Route path="transmissions" element={<Transmissions />} />
          <Route path="halls" element={<Halls />} />
        </Route>
        
        {/* Fallback routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      <Toaster position="top-right" />
    </>
  );
}

export default App;