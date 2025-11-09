import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components';
import { AreasOfInterestSelector } from '../components/AreasOfInterestSelector';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    jobTitle: '',
    company: '',
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    websiteUrl: '',
  });
  
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        linkedinUrl: user.linkedinUrl || '',
        twitterUrl: user.twitterUrl || '',
        instagramUrl: user.instagramUrl || '',
        websiteUrl: user.websiteUrl || '',
      });
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Update user profile
      const response = await userApi.createUser(formData);
      
      if (!response.success) {
        setError(response.error?.message || 'Error al actualizar perfil');
        setIsLoading(false);
        return;
      }
      
      // Update interests if any
      if (interests.length > 0 && user) {
        await userApi.updateInterests(user.id, interests);
      }
      
      // Update local user data
      if (response.data) {
        updateUser(response.data.user);
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      setError('Error al guardar el perfil');
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              Completa tu perfil
            </h1>
            <p className="text-gray-600">
              Esta información será visible para otros asistentes cuando te conectes con ellos
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Información Básica */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Básica
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Nombre completo *"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="Juan Pérez"
                />
                
                <Input
                  label="Teléfono *"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="+56 9 1234 5678"
                  pattern="[0-9+\-\s()]{8,}"
                />
                
                <Input
                  label="Cargo"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Product Manager"
                />
                
                <Input
                  label="Empresa"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  fullWidth
                  placeholder="TechCorp"
                />
              </div>
            </div>
            
            {/* Áreas de Interés */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Áreas de Interés
              </h2>
              <AreasOfInterestSelector
                selectedAreas={interests}
                onSelectionChange={setInterests}
              />
            </div>
            
            {/* Redes Sociales */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Redes Sociales (Opcional)
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="LinkedIn"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://linkedin.com/in/tu-perfil"
                />
                
                <Input
                  label="Twitter"
                  name="twitterUrl"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://twitter.com/tu-usuario"
                />
                
                <Input
                  label="Instagram"
                  name="instagramUrl"
                  type="url"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://instagram.com/tu-usuario"
                />
                
                <Input
                  label="Sitio Web"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://tu-sitio.com"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading || !formData.name || !formData.phone}
            >
              {isLoading ? 'Guardando...' : 'Guardar Perfil'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
