import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { verifyAdminToken } from '@/services/api';

const ProtectedRoute = () => {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('denied');
        return;
      }

      try {
        const isValid = await verifyAdminToken(token);
        setStatus(isValid ? 'allowed' : 'denied');
      } catch {
        setStatus('denied');
      }
    };

    checkAuth();
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (status === 'denied') {
    localStorage.removeItem('token');
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
