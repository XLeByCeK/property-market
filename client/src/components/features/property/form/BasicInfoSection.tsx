import React from 'react';
import { PropertyFormData } from '../../../../types/property';

interface BasicInfoSectionProps {
  formData: PropertyFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

/**
 * Секция «Основная информация» формы свойства: заголовок, описание, цена,
 * площадь, комнаты, этажность, год постройки.
 */
export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => (
  <div className="form-section">
    <h2>Basic Information</h2>

    <div className="form-group">
      <label htmlFor="title">Title*</label>
      <input
        type="text"
        id="title"
        name="title"
        value={formData.title}
        onChange={onChange}
        required
        maxLength={100}
        placeholder="Enter property title"
      />
    </div>

    <div className="form-group">
      <label htmlFor="description">Description*</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={onChange}
        required
        rows={5}
        placeholder="Describe your property"
      />
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="price">Price (₽)*</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price || ''}
          onChange={onChange}
          required
          min={0}
          placeholder="Enter price"
        />
      </div>

      <div className="form-group">
        <label htmlFor="area">Area (m²)*</label>
        <input
          type="number"
          id="area"
          name="area"
          value={formData.area || ''}
          onChange={onChange}
          required
          min={0}
          step="0.1"
          placeholder="Enter area"
        />
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="rooms">Rooms*</label>
        <input
          type="number"
          id="rooms"
          name="rooms"
          value={formData.rooms || ''}
          onChange={onChange}
          required
          min={0}
          placeholder="Number of rooms"
        />
      </div>

      <div className="form-group">
        <label htmlFor="floor">Floor</label>
        <input
          type="number"
          id="floor"
          name="floor"
          value={formData.floor || ''}
          onChange={onChange}
          min={0}
          placeholder="Floor number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="total_floors">Total Floors</label>
        <input
          type="number"
          id="total_floors"
          name="total_floors"
          value={formData.total_floors || ''}
          onChange={onChange}
          min={0}
          placeholder="Total floors in building"
        />
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="year_built">Year Built</label>
      <input
        type="number"
        id="year_built"
        name="year_built"
        value={formData.year_built || ''}
        onChange={onChange}
        min={1900}
        max={new Date().getFullYear()}
        placeholder="Year of construction"
      />
    </div>
  </div>
);
