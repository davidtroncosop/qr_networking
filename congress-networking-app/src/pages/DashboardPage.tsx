import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.name}
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Crear Evento
              </h2>
              <p className="text-gray-600 mb-4">
                Configura un nuevo evento y genera el código QR
              </p>
              <Button onClick={() => navigate('/dashboard/events/create')}>
                Crear Evento
              </Button>
            </div>
          </Card>
          
          <Card>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Mi Perfil
              </h2>
              <p className="text-gray-600 mb-4">
                Actualiza tu información personal
              </p>
              <Button variant="outline" onClick={() => navigate('/profile/setup')}>
                Ver Perfil
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Mis Eventos */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mis Eventos
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-600 mb-4">
              Aún no has creado ningún evento
            </p>
            <Button onClick={() => navigate('/dashboard/events/create')}>
              Crear tu primer evento
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
