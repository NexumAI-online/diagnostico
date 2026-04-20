import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Toast } from '../components/Toast';
import { useAppStore } from '../store/useAppStore';
import { loginUser, fetchMe } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, setSession } = useAppStore();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya hay cookie de sesión válida, saltar directo al cuestionario
    fetchMe().then((r) => {
      if (r.authenticated && r.usuario) {
        setSession(r.usuario);
        navigate('/cuestionario', { replace: true });
      }
    });
  }, [navigate, setSession]);

  const handleSubmit = async () => {
    if (!usuario || !contrasena || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loginUser(usuario, contrasena);
      const respuesta = result.respuesta;

      if (respuesta === 'Acceso exitoso') {
        setSession(usuario);
        navigate('/cuestionario');
      } else if (respuesta === 'El usuario no existe') {
        setError('Lo siento, el usuario no existe.');
      } else if (respuesta === 'Contraseña incorrecta') {
        setError('La contraseña es incorrecta.');
      } else {
        setError('Hubo un problema de conexión. Reintentá.');
      }
    } catch {
      setError('Hubo un problema de conexión. Reintentá.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isDisabled = !usuario || !contrasena;

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md animate-scale-in">
          <GlassCard>
            {/* Logo / Title */}
            <div className="text-center mb-8">
              <img
                src="/logo-nexum.svg"
                alt="Nexum"
                className="h-14 mx-auto mb-5"
                style={{ filter: 'drop-shadow(0 0 24px rgba(242,57,255,0.35))' }}
              />
              <h1
                className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2 text-nexum-gradient"
              >
                Iniciación
              </h1>
              <p className="text-gray-400 text-sm">
                Ingresá tus credenciales para continuar
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="Tu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #F239FF';
                    e.target.style.boxShadow = '0 0 12px rgba(242,57,255,0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #F239FF';
                    e.target.style.boxShadow = '0 0 12px rgba(242,57,255,0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={isDisabled}
              loading={loading}
              loadingText="Validando…"
              fullWidth
            >
              Iniciar sesión
            </PrimaryButton>

            {/* Error banner */}
            <div className="mt-4">
              <Toast
                type="error"
                message={error || ''}
                visible={!!error}
                onClose={() => setError(null)}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
