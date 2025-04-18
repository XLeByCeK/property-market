import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as propertyService from '../../services/propertyService';
import { PropertyFormData } from '../../services/propertyService';

// Define interfaces for select options
interface SelectOption {
  id: number;
  name: string;
}

interface PropertyFormProps {
  propertyId?: number; // Optional for edit mode
  initialData?: Partial<PropertyFormData>; // Optional initial data for edit mode
}

const PropertyForm: React.FC<PropertyFormProps> = ({ propertyId, initialData }) => {
  const router = useRouter();
  const isEditMode = !!propertyId;
  
  // State for form data
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: 0,
    area: 0,
    rooms: 1,
    address: '',
    property_type_id: 0,
    transaction_type_id: 0,
    city_id: 0,
    is_new_building: false,
    is_commercial: false,
    is_country: false,
    images: [],
    ...initialData
  });

  // State for dropdowns
  const [propertyTypes, setPropertyTypes] = useState<SelectOption[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [metroStations, setMetroStations] = useState<SelectOption[]>([]);
  
  // State for image uploads
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(formData.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch reference data on component mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch reference data using propertyService
        const [propertyTypesData, transactionTypesData, citiesData] = await Promise.all([
          propertyService.getPropertyTypes(),
          propertyService.getTransactionTypes(),
          propertyService.getCities(),
        ]);
        
        setPropertyTypes(propertyTypesData as SelectOption[]);
        setTransactionTypes(transactionTypesData as SelectOption[]);
        setCities(citiesData as SelectOption[]);
      } catch (error) {
        console.error('Error fetching reference data:', error);
        setError('Failed to load form data. Please try again later.');
      }
    };

    fetchReferenceData();
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.city_id) {
        try {
          const districtsData = await propertyService.getDistrictsByCityId(formData.city_id);
          setDistricts(districtsData as SelectOption[]);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      } else {
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [formData.city_id]);

  // Fetch metro stations when city changes
  useEffect(() => {
    const fetchMetroStations = async () => {
      if (formData.city_id) {
        try {
          const metroData = await propertyService.getMetroStationsByCityId(formData.city_id);
          setMetroStations(metroData as SelectOption[]);
        } catch (error) {
          console.error('Error fetching metro stations:', error);
        }
      } else {
        setMetroStations([]);
      }
    };

    fetchMetroStations();
  }, [formData.city_id]);

  // Fetch property data for edit mode
  useEffect(() => {
    if (isEditMode && propertyId && !initialData) {
      const fetchPropertyData = async () => {
        try {
          const property = await propertyService.getPropertyById(propertyId);
          const propertyData = propertyService.transformPropertyToFormData(property as any);
          setFormData(propertyData);
          setUploadedImageUrls(propertyData.images);
        } catch (error) {
          console.error('Error fetching property data:', error);
          setError('Failed to load property data. Please try again later.');
        }
      };

      fetchPropertyData();
    }
  }, [isEditMode, propertyId, initialData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value ? Number(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const formDataForImage = new FormData();
    
    files.forEach(file => {
      formDataForImage.append('images', file);
    });
    
    try {
      const response = await propertyService.uploadPropertyImages(formDataForImage);
      const newImageUrls = (response as any).imageUrls;
      
      console.log('Uploaded image URLs:', newImageUrls);
      
      // Fix URLs if needed (make sure they start with http or / for proper loading)
      const processedUrls = newImageUrls.map((url: string) => {
        // If URL doesn't start with http or /, add the API base URL
        if (!url.startsWith('http') && !url.startsWith('/')) {
          return `/${url}`;
        }
        return url;
      });
      
      console.log('Processed image URLs:', processedUrls);
      
      setUploadedImageUrls([...uploadedImageUrls, ...processedUrls]);
      setFormData({ ...formData, images: [...formData.images, ...processedUrls] });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  // Remove an uploaded image
  const handleRemoveImage = (urlToRemove: string) => {
    const updatedUrls = uploadedImageUrls.filter(url => url !== urlToRemove);
    setUploadedImageUrls(updatedUrls);
    setFormData({ ...formData, images: updatedUrls });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Проверка данных перед отправкой
    if (formData.images.length === 0) {
      setError('Необходимо загрузить хотя бы одно изображение');
      setIsSubmitting(false);
      return;
    }

    if (!formData.property_type_id || formData.property_type_id === 0) {
      setError('Выберите тип недвижимости');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.transaction_type_id || formData.transaction_type_id === 0) {
      setError('Выберите тип сделки');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.city_id || formData.city_id === 0) {
      setError('Выберите город');
      setIsSubmitting(false);
      return;
    }
    
    // Конвертируем числовые значения в числа, так как они могут быть в виде строк
    const preparedData = {
      ...formData,
      price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
      area: typeof formData.area === 'string' ? parseFloat(formData.area) : formData.area,
      rooms: typeof formData.rooms === 'string' ? parseInt(formData.rooms, 10) : formData.rooms,
      floor: formData.floor ? (typeof formData.floor === 'string' ? parseInt(formData.floor, 10) : formData.floor) : undefined,
      total_floors: formData.total_floors ? (typeof formData.total_floors === 'string' ? parseInt(formData.total_floors, 10) : formData.total_floors) : undefined,
      year_built: formData.year_built ? (typeof formData.year_built === 'string' ? parseInt(formData.year_built, 10) : formData.year_built) : undefined,
      property_type_id: typeof formData.property_type_id === 'string' ? parseInt(formData.property_type_id, 10) : formData.property_type_id,
      transaction_type_id: typeof formData.transaction_type_id === 'string' ? parseInt(formData.transaction_type_id, 10) : formData.transaction_type_id,
      city_id: typeof formData.city_id === 'string' ? parseInt(formData.city_id, 10) : formData.city_id,
      district_id: formData.district_id ? (typeof formData.district_id === 'string' ? parseInt(formData.district_id, 10) : formData.district_id) : undefined,
      metro_id: formData.metro_id ? (typeof formData.metro_id === 'string' ? parseInt(formData.metro_id, 10) : formData.metro_id) : undefined,
      metro_distance: formData.metro_distance ? (typeof formData.metro_distance === 'string' ? parseFloat(formData.metro_distance) : formData.metro_distance) : undefined,
    };
    
    console.log('Submitting property data:', preparedData);
    
    try {
      if (isEditMode) {
        await propertyService.updateProperty(propertyId!, preparedData);
        alert('Property updated successfully!');
      } else {
        await propertyService.createProperty(preparedData);
        alert('Property created successfully!');
      }
      
      // Redirect to property listing or detail page
      router.push('/profile/properties');
    } catch (error: any) {
      console.error('Error saving property:', error);
      
      // Более подробное логирование ошибки
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Отображаем более детальную ошибку
        if (error.response.data && error.response.data.error) {
          setError(`Ошибка: ${error.response.data.error}`);
        } else {
          setError(`Ошибка сервера: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('Ошибка сети: запрос отправлен, но ответ не получен');
      } else {
        console.error('Error message:', error.message);
        setError(`Ошибка: ${error.message}`);
      }
      
      alert('Не удалось сохранить объявление. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="property-form-container">
      <h1 className="form-title">{isEditMode ? 'Edit Property' : 'Create New Property'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
              onChange={handleInputChange}
              min={1900}
              max={new Date().getFullYear()}
              placeholder="Year of construction"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Property Type & Location</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="property_type_id">Property Type*</label>
              <select
                id="property_type_id"
                name="property_type_id"
                value={formData.property_type_id || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select property type</option>
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="transaction_type_id">Transaction Type*</label>
              <select
                id="transaction_type_id"
                name="transaction_type_id"
                value={formData.transaction_type_id || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select transaction type</option>
                {transactionTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Enter full address"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city_id">City*</label>
              <select
                id="city_id"
                name="city_id"
                value={formData.city_id || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            
            {districts.length > 0 && (
              <div className="form-group">
                <label htmlFor="district_id">District</label>
                <select
                  id="district_id"
                  name="district_id"
                  value={formData.district_id || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select district</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {metroStations.length > 0 && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="metro_id">Metro Station</label>
                <select
                  id="metro_id"
                  name="metro_id"
                  value={formData.metro_id || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select metro station</option>
                  {metroStations.map(station => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>
              
              {formData.metro_id && (
                <div className="form-group">
                  <label htmlFor="metro_distance">Distance to Metro (minutes)</label>
                  <input
                    type="number"
                    id="metro_distance"
                    name="metro_distance"
                    value={formData.metro_distance || ''}
                    onChange={handleInputChange}
                    min={1}
                    placeholder="Walking distance in minutes"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Property Features</h2>
          
          <div className="checkbox-group">
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="is_new_building"
                name="is_new_building"
                checked={formData.is_new_building}
                onChange={handleInputChange}
              />
              <label htmlFor="is_new_building">New Building</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="is_commercial"
                name="is_commercial"
                checked={formData.is_commercial}
                onChange={handleInputChange}
              />
              <label htmlFor="is_commercial">Commercial Property</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="is_country"
                name="is_country"
                checked={formData.is_country}
                onChange={handleInputChange}
              />
              <label htmlFor="is_country">Country/Suburban Property</label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Property Images</h2>
          
          <div className="image-upload">
            <label htmlFor="images" className="upload-label">
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span>Click to upload images</span>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
          </div>
          
          {uploadedImageUrls.length > 0 && (
            <div className="image-preview-grid">
              {uploadedImageUrls.map((url, index) => {
                // Log each URL for debugging
                console.log(`Preview image ${index + 1}:`, url);
                
                // Make sure URL is properly formatted
                const imageUrl = url.startsWith('http') || url.startsWith('/') ? url : `/${url}`;
                
                return (
                  <div key={index} className="image-preview-item">
                    <img
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      className="preview-image"
                      onError={(e) => {
                        console.error(`Error loading image ${index + 1}:`, imageUrl);
                        (e.target as HTMLImageElement).src = '/images/null-image.jpg'; // Fallback image
                      }}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(url)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="image-note">
            <p>First image will be used as the main property image. You can upload up to 10 images.</p>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm; 