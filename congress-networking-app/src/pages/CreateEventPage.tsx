import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components';
import { eventApi } from '../services/api';

export function CreateEventPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await eventApi.createEvent(formData);
      
      if (!response.success) {
        setError(response.error?.message || 'Error al crear evento');
        setIsLoading(false);
        return;
      }
      
      // Redirect to event page
      if (response.data?.event) {
        navigate(`/dashboard/events/${response.data.event.id}`);
      }
      
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
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Evento
            </h1>
            <p className="text-gray-600">
              Configura tu evento y genera un código QR para que los asistentes se registren
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
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
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth
                disabled={isLoading || !formData.name || !formData.startDate || !formData.endDate}
              >
                {isLoading ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
