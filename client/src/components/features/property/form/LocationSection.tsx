import React from 'react';
import { PropertyFormData } from '../../../../types/property';
import { SelectOption } from './useReferenceData';

interface LocationSectionProps {
  formData: PropertyFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  propertyTypes: SelectOption[];
  transactionTypes: SelectOption[];
  cities: SelectOption[];
  districts: SelectOption[];
  metroStations: SelectOption[];
}

const SelectField: React.FC<{
  id: keyof PropertyFormData;
  label: string;
  value: number | undefined;
  options: SelectOption[];
  placeholder: string;
  required?: boolean;
  onChange: LocationSectionProps['onChange'];
}> = ({ id, label, value, options, placeholder, required, onChange }) => (
  <div className="form-group">
    <label htmlFor={id}>
      {label}
      {required ? '*' : ''}
    </label>
    <select id={id} name={id} value={value || ''} onChange={onChange} required={required}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Секция «Тип и местоположение»: тип недвижимости, тип сделки, адрес,
 * город/район/метро.
 */
export const LocationSection: React.FC<LocationSectionProps> = ({
  formData,
  onChange,
  propertyTypes,
  transactionTypes,
  cities,
  districts,
  metroStations,
}) => (
  <div className="form-section">
    <h2>Property Type & Location</h2>

    <div className="form-row">
      <SelectField
        id="property_type_id"
        label="Property Type"
        value={formData.property_type_id}
        options={propertyTypes}
        placeholder="Select property type"
        required
        onChange={onChange}
      />
      <SelectField
        id="transaction_type_id"
        label="Transaction Type"
        value={formData.transaction_type_id}
        options={transactionTypes}
        placeholder="Select transaction type"
        required
        onChange={onChange}
      />
    </div>

    <div className="form-group">
      <label htmlFor="address">Address*</label>
      <input
        type="text"
        id="address"
        name="address"
        value={formData.address}
        onChange={onChange}
        required
        placeholder="Enter full address"
      />
    </div>

    <div className="form-row">
      <SelectField
        id="city_id"
        label="City"
        value={formData.city_id}
        options={cities}
        placeholder="Select city"
        required
        onChange={onChange}
      />
      {districts.length > 0 && (
        <SelectField
          id="district_id"
          label="District"
          value={formData.district_id}
          options={districts}
          placeholder="Select district"
          onChange={onChange}
        />
      )}
    </div>

    {metroStations.length > 0 && (
      <div className="form-row">
        <SelectField
          id="metro_id"
          label="Metro Station"
          value={formData.metro_id}
          options={metroStations}
          placeholder="Select metro station"
          onChange={onChange}
        />
        {formData.metro_id && (
          <div className="form-group">
            <label htmlFor="metro_distance">Distance to Metro (minutes)</label>
            <input
              type="number"
              id="metro_distance"
              name="metro_distance"
              value={formData.metro_distance || ''}
              onChange={onChange}
              min={1}
              placeholder="Walking distance in minutes"
            />
          </div>
        )}
      </div>
    )}
  </div>
);
