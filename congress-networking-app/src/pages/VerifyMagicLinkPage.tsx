import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function VerifyMagicLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setError('Token no encontrado en la URL');
        return;
      }
      
      try {
        const response = await authApi.verifyMagicLink(token);
        
        if (response.success && response.data) {
          setStatus('success');
          login(response.data.jwt, response.data.user);
          
          // Redirect after a short delay
          setTimeout(() => {
            if (response.data!.isNewUser) {
              navigate('/profile/setup');
            } else if (response.data!.eventId) {
              navigate(`/events/${response.data!.eventId}`);
            } else {
              navigate('/dashboard');
            }
          }, 1500);
        } else {
          setStatus('error');
          setError(response.error?.message || 'Token inválido o expirado');
        }
      } catch (err) {
        setStatus('error');
        setError('Error al verificar el token');
      }
    };
    
    verifyToken();
  }, [searchParams, navigate, login]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificando...
              </h2>
              <p className="text-gray-600">
                Estamos verificando tu link de acceso
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Acceso exitoso!
              </h2>
              <p className="text-gray-600">
                Redirigiendo...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error de verificación
              </h2>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Volver a intentar
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
