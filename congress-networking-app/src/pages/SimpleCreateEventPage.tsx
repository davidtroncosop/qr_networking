import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components';

export function SimpleCreateEventPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    organizerName: '',
    organizerEmail: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [eventId, setEventId] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/simple-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error?.message || 'Error al crear evento');
        setIsLoading(false);
        return;
      }
      
      // Mostrar el ID del evento y la URL
      setEventId(data.data.event.id);
      setIsLoading(false);
      
    } catch (err) {
      setError('Error al crear el evento');
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  if (eventId) {
    const registrationUrl = `https://qr-networking.pages.dev/event/${eventId}/register`;
    
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Evento Creado!
              </h1>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  URL para compartir:
                </p>
                <div className="bg-white p-3 rounded border border-gray-300 mb-2">
                  <code className="text-sm break-all">{registrationUrl}</code>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(registrationUrl);
                    alert('URL copiada!');
                  }}
                  variant="outline"
                  size="sm"
                >
                  📋 Copiar URL
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => window.open(registrationUrl, '_blank')}
                  fullWidth
                >
                  🔗 Abrir Página de Registro
                </Button>
                
                <Button
                  onClick={() => {
                    setEventId('');
                    setFormData({
                      name: '',
                      description: '',
                      startDate: '',
                      endDate: '',
                      location: '',
                      organizerName: '',
                      organizerEmail: ''
                    });
                  }}
                  variant="outline"
                  fullWidth
                >
                  ➕ Crear Otro Evento
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Evento Rápido
            </h1>
            <p className="text-gray-600">
              Crea un evento y obtén la URL para compartir con asistentes
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Tu nombre *"
                name="organizerName"
                type="text"
                value={formData.organizerName}
                onChange={handleChange}
                required
                fullWidth
                placeholder="Juan Pérez"
              />
              
              <Input
                label="Tu email *"
                name="organizerEmail"
                type="email"
                value={formData.organizerEmail}
                onChange={handleChange}
                required
                fullWidth
                placeholder="juan@ejemplo.com"
              />
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Información del Evento</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Nombre del evento *"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder="Tech Summit 2025"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Congreso de tecnología e innovación..."
                    />
                  </div>
                  
                  <Input
                    label="Fecha de inicio *"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  
                  <Input
                    label="Fecha de fin *"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  
                  <Input
                    label="Ubicación"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Centro de Convenciones"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  size="lg"
                >
                  {isLoading ? '⏳ Creando...' : '✨ Crear Evento'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
