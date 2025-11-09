import { useState } from 'react';
import { INTEREST_CATEGORIES } from '../utils/constants';

interface AreasOfInterestSelectorProps {
  selectedAreas: string[];
  onSelectionChange: (areas: string[]) => void;
}

export function AreasOfInterestSelector({
  selectedAreas,
  onSelectionChange,
}: AreasOfInterestSelectorProps) {
  const [customInterest, setCustomInterest] = useState('');
  
  const toggleInterest = (interest: string) => {
    if (selectedAreas.includes(interest)) {
      onSelectionChange(selectedAreas.filter(a => a !== interest));
    } else {
      onSelectionChange([...selectedAreas, interest]);
    }
  };
  
  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedAreas.includes(customInterest.trim())) {
      onSelectionChange([...selectedAreas, customInterest.trim()]);
      setCustomInterest('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };
  
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        Selecciona las áreas que te interesan (puedes elegir varias)
      </p>
      
      {/* Predefined categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {INTEREST_CATEGORIES.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                selectedAreas.includes(interest)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {interest}
          </button>
        ))}
      </div>
      
      {/* Custom interest input */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Agregar área personalizada
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ej: Blockchain, IA, etc."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            disabled={!customInterest.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
      
      {/* Selected interests */}
      {selectedAreas.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Áreas seleccionadas ({selectedAreas.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedAreas.map((interest) => (
              <div
                key={interest}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
