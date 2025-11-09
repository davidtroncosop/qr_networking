import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card } from '../components';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const eventId = searchParams.get('eventId');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [tempToken, setTempToken] = useState(''); // Temporal para desarrollo
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authApi.requestMagicLink(email, eventId || undefined);
      
      if (response.success && response.data) {
        setMagicLinkSent(true);
        // Temporal: Guardar token para desarrollo
        setTempToken(response.data.token);
      } else {
        setError(response.error?.message || 'Error al enviar el link');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyToken = async (token: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.verifyMagicLink(token);
      
      if (response.success && response.data) {
        login(response.data.jwt, response.data.user);
        
        // Redirect based on context
        if (response.data.isNewUser) {
          navigate('/profile/setup');
        } else if (response.data.eventId) {
          navigate(`/events/${response.data.eventId}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.error?.message || 'Token inválido');
      }
    } catch (err) {
      setError('Error al verificar el token');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Revisa tu email!
            </h2>
            <p className="text-gray-600 mb-6">
              Te hemos enviado un link mágico a <strong>{email}</strong>
            </p>
            
            {/* TEMPORAL: Mostrar token para desarrollo */}
            {tempToken && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Modo desarrollo:</strong> Usa este token
                </p>
                <Input
                  value={tempToken}
                  readOnly
                  fullWidth
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => handleVerifyToken(tempToken)}
                  className="mt-2"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Verificar Token'}
                </Button>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              El link expira en 15 minutos
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => {
                setMagicLinkSent(false);
                setTempToken('');
              }}
              fullWidth
            >
              Usar otro email
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h2>
          {eventId && (
            <p className="text-gray-600">
              Accediendo al evento
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            className="mb-4"
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Button
            type="submit"
            fullWidth
            disabled={isLoading || !email}
          >
            {isLoading ? 'Enviando...' : 'Enviar Link Mágico'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Te enviaremos un link de acceso a tu email
          </p>
        </div>
      </Card>
    </div>
  );
}
