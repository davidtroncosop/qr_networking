import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components';
import { AreasOfInterestSelector } from '../components/AreasOfInterestSelector';

export function QuickRegisterPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    websiteUrl: ''
  });
  
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Nombre y email son requeridos');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Crear usuario y registrarlo al evento
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/quick-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          interests
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Guardar userId en localStorage para mantener la sesión
        localStorage.setItem('attendeeId', data.data.user.id);
        localStorage.setItem('attendeeEventId', eventId!);
        
        // Redirigir a la página del evento como asistente
        navigate(`/event/${eventId}/attendee`);
      } else {
        setError(data.error?.message || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido al Evento! 🎉
            </h1>
            <p className="text-gray-600">
              Completa tus datos para unirte y empezar a conectar con otros asistentes
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos básicos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@ejemplo.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
            
            {/* Información profesional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <Input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="CEO, Desarrollador, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <Input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Mi Empresa"
                />
              </div>
            </div>
            
            {/* Redes sociales */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Redes Sociales (Opcional)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    💼 LinkedIn
                  </label>
                  <Input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🐦 Twitter
                  </label>
                  <Input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/tu-usuario"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📷 Instagram
                  </label>
                  <Input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/tu-usuario"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🌐 Sitio Web
                  </label>
                  <Input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://tu-sitio.com"
                  />
                </div>
              </div>
            </div>
            
            {/* Áreas de interés */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Áreas de Interés
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Selecciona tus áreas de interés para conectar con personas afines
              </p>
              <AreasOfInterestSelector
                selectedInterests={interests}
                onChange={setInterests}
              />
            </div>
            
            {/* Botón de envío */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                fullWidth
                size="lg"
              >
                {isSubmitting ? '⏳ Registrando...' : '✅ Unirme al Evento'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
