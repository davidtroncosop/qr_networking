import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components';
import { eventApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'qrcode';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadEventData();
  }, [eventId]);
  
  const loadEventData = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      // Load event
      const eventResponse = await eventApi.getEvent(eventId);
      if (eventResponse.success && eventResponse.data) {
        setEvent(eventResponse.data.event);
        
        // Generate QR code with the registration URL
        const registrationUrl = `https://qr-networking.pages.dev/event/${eventId}/register`;
        const qr = await QRCode.toDataURL(registrationUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qr);
      }
      
      // Load attendees
      const attendeesResponse = await eventApi.getAttendees(eventId);
      if (attendeesResponse.success && attendeesResponse.data) {
        setAttendees(attendeesResponse.data.attendees);
      }
      
    } catch (err) {
      setError('Error al cargar el evento');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleActive = async () => {
    if (!eventId || !event) return;
    
    try {
      const response = await eventApi.updateEvent(eventId, {
        isActive: !event.isActive
      });
      
      if (response.success && response.data) {
        setEvent(response.data.event);
      }
    } catch (err) {
      setError('Error al actualizar el evento');
    }
  };
  
  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `evento-${event?.name || 'qr'}.png`;
    link.href = qrCodeUrl;
    link.click();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error
            </h2>
            <p className="text-gray-600 mb-4">{error || 'Evento no encontrado'}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  const isOrganizer = event.organizerId === user?.id;
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.isActive ? '🟢 Activo' : '⚫ Inactivo'}
                </span>
              </div>
            </div>
            
            {isOrganizer && (
              <Button
                variant="outline"
                onClick={handleToggleActive}
              >
                {event.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Event Info */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información del Evento
            </h2>
            
            <div className="space-y-3">
              {event.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="text-gray-900">{event.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de inicio</p>
                <p className="text-gray-900">
                  {startDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de fin</p>
                <p className="text-gray-900">
                  {endDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {event.location && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Ubicación</p>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Asistentes registrados</p>
                <p className="text-2xl font-bold text-primary-600">{attendees.length}</p>
              </div>
            </div>
          </Card>
          
          {/* QR Code */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Código QR del Evento
            </h2>
            
            <div className="text-center">
              {qrCodeUrl ? (
                <>
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Los asistentes pueden escanear este código para registrarse al evento
                  </p>
                  
                  <div className="flex gap-2 justify-center">
                    <Button onClick={downloadQR}>
                      📥 Descargar QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const registrationUrl = `https://qr-networking.pages.dev/event/${eventId}/register`;
                        navigator.clipboard.writeText(registrationUrl);
                        alert('URL copiada al portapapeles');
                      }}
                    >
                      📋 Copiar URL
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Generando código QR...</p>
              )}
            </div>
          </Card>
        </div>
        
        {/* Attendees List */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lista de Asistentes ({attendees.length})
          </h2>
          
          {attendees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-600">
                Aún no hay asistentes registrados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attendee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attendee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.jobTitle || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.company || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendee.role === 'organizer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {attendee.role === 'organizer' ? 'Organizador' : 'Asistente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
