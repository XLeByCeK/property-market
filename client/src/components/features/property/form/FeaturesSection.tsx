import React from 'react';
import { PropertyFormData } from '../../../../types/property';

interface FeaturesSectionProps {
  formData: PropertyFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

const FEATURES: Array<{ name: keyof PropertyFormData; label: string }> = [
  { name: 'is_new_building', label: 'New Building' },
  { name: 'is_commercial', label: 'Commercial Property' },
  { name: 'is_country', label: 'Country/Suburban Property' },
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ formData, onChange }) => (
  <div className="form-section">
    <h2>Property Features</h2>
    <div className="checkbox-group">
      {FEATURES.map(({ name, label }) => (
        <div key={name} className="form-checkbox">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={Boolean(formData[name])}
            onChange={onChange}
          />
          <label htmlFor={name}>{label}</label>
        </div>
      ))}
    </div>
  </div>
);
