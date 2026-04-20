import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { fetchMe } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredState: 'username' | 'roadmapData';
}

export function ProtectedRoute({ children, requiredState }: ProtectedRouteProps) {
  const { session, roadmapData, setSession, setAnon } = useAppStore();

  // Revalida siempre contra el backend (la autoridad es la cookie httpOnly).
  // El estado en memoria nunca alcanza por sí solo.
  useEffect(() => {
    let cancel = false;
    fetchMe().then((r) => {
      if (cancel) return;
      if (r.authenticated && r.usuario) setSession(r.usuario);
      else setAnon();
    });
    return () => { cancel = true; };
  }, [setSession, setAnon]);

  if (requiredState === 'username') {
    if (session.status === 'unknown') {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full animate-pulse"
            style={{ background: 'linear-gradient(135deg, #F239FF 0%, #8943E3 100%)' }}
          />
        </div>
      );
    }
    if (session.status === 'anon') {
      return <Navigate to="/login" replace />;
    }
  }

  if (requiredState === 'roadmapData' && !roadmapData) {
    return <Navigate to="/cuestionario" replace />;
  }

  return <>{children}</>;
}
