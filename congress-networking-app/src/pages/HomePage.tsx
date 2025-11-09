import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components';

export function HomePage() {
  const navigate = useNavigate();
  const [eventCode, setEventCode] = useState('');
  
  const handleAttendeeClick = () => {
    navigate('/auth');
  };
  
  const handleOrganizerClick = () => {
    navigate('/auth');
  };
  
  const handleEventCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim()) {
      navigate(`/e/${eventCode.trim()}`);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20">
        <div className="mb-6">
          <span className="text-6xl md:text-8xl">🎯</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Networking Inteligente
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8">
          para Eventos y Congresos
        </h2>
        
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Conecta con otros asistentes escaneando códigos QR. 
          Sin tarjetas físicas, sin complicaciones.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={handleAttendeeClick}
            className="min-w-[200px]"
          >
            <span className="mr-2">👤</span>
            Soy Asistente
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            onClick={handleOrganizerClick}
            className="min-w-[200px]"
          >
            <span className="mr-2">🏛️</span>
            Soy Organizador
          </Button>
        </div>
        
        {/* Event Code Input */}
        <Card className="max-w-md mx-auto">
          <form onSubmit={handleEventCodeSubmit}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ingresa código del evento
            </h3>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ej: TECH2025"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                fullWidth
                className="uppercase"
              />
              <Button type="submit">
                Entrar
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 py-12 border-t border-gray-200">
        <div className="text-center">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-semibold text-gray-900 mb-2">Sin instalación</h3>
          <p className="text-gray-600 text-sm">
            Accede instantáneamente desde tu navegador móvil
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="font-semibold text-gray-900 mb-2">Escanea QR</h3>
          <p className="text-gray-600 text-sm">
            Conecta con otros asistentes en segundos
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="font-semibold text-gray-900 mb-2">Conecta al instante</h3>
          <p className="text-gray-600 text-sm">
            Guarda contactos y redes sociales automáticamente
          </p>
        </div>
      </div>
    </div>
  );
}
