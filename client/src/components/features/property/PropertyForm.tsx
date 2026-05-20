import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import * as propertyService from '../../../services/propertyService';
import { PropertyFormData, PropertyFromAPI } from '../../../types/property';
import { BasicInfoSection } from './form/BasicInfoSection';
import { FeaturesSection } from './form/FeaturesSection';
import { ImagesSection } from './form/ImagesSection';
import { LocationSection } from './form/LocationSection';
import { useReferenceData } from './form/useReferenceData';

interface PropertyFormProps {
  /** Опциональный ID для режима редактирования. */
  propertyId?: number;
  /** Начальные данные (например, из родительской страницы редактирования). */
  initialData?: Partial<PropertyFormData>;
}

const EMPTY_FORM: PropertyFormData = {
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
};

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Приводит «сырые» строковые значения формы к числам перед отправкой на сервер.
 * Сервер требует числовых типов для ID и количественных полей.
 */
const prepareForSubmit = (data: PropertyFormData): PropertyFormData => ({
  ...data,
  price: toNumber(data.price) ?? 0,
  area: toNumber(data.area) ?? 0,
  rooms: toNumber(data.rooms) ?? 0,
  floor: toNumber(data.floor),
  total_floors: toNumber(data.total_floors),
  year_built: toNumber(data.year_built),
  property_type_id: toNumber(data.property_type_id) ?? 0,
  transaction_type_id: toNumber(data.transaction_type_id) ?? 0,
  city_id: toNumber(data.city_id) ?? 0,
  district_id: toNumber(data.district_id),
  metro_id: toNumber(data.metro_id),
  metro_distance: toNumber(data.metro_distance),
});

const PropertyForm: React.FC<PropertyFormProps> = ({ propertyId, initialData }) => {
  const router = useRouter();
  const isEditMode = Boolean(propertyId);

  const [formData, setFormData] = useState<PropertyFormData>({ ...EMPTY_FORM, ...initialData });
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(formData.images);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const { propertyTypes, transactionTypes, cities, districts, metroStations, error: refError } =
    useReferenceData(formData.city_id || undefined);

  // Если страница редактирования сама не передала initialData — подгружаем из API.
  useEffect(() => {
    if (!isEditMode || !propertyId || initialData) return;

    let cancelled = false;
    (async () => {
      try {
        const property = (await propertyService.getPropertyById(propertyId)) as PropertyFromAPI;
        if (cancelled) return;
        const data = propertyService.transformPropertyToFormData(property);
        setFormData(data);
        setUploadedImageUrls(data.images);
      } catch (err) {
        console.error('Error fetching property data:', err);
        if (!cancelled) setError('Failed to load property data. Please try again later.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, propertyId, initialData]);

  useEffect(() => {
    if (refError) setError(refError);
  }, [refError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      if (type === 'checkbox') {
        return { ...prev, [name]: (e.target as HTMLInputElement).checked };
      }
      if (type === 'number') {
        return { ...prev, [name]: value ? Number(value) : undefined };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const formDataForImage = new FormData();
    Array.from(e.target.files).forEach((file) => formDataForImage.append('images', file));

    try {
      const response = await propertyService.uploadPropertyImages(formDataForImage);
      const newImageUrls = response.imageUrls;
      // В стейте и БД храним относительные пути из YC; в превью getImageUrl
      // соберёт абсолютный URL Yandex Object Storage.
      setUploadedImageUrls((prev) => [...prev, ...newImageUrls]);
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Failed to upload images. Please try again.');
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const updated = uploadedImageUrls.filter((url) => url !== urlToRemove);
    setUploadedImageUrls(updated);
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const validate = (): string | null => {
    if (formData.images.length === 0) return 'Необходимо загрузить хотя бы одно изображение';
    if (!formData.property_type_id) return 'Выберите тип недвижимости';
    if (!formData.transaction_type_id) return 'Выберите тип сделки';
    if (!formData.city_id) return 'Выберите город';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = prepareForSubmit(formData);
      if (isEditMode) {
        await propertyService.updateProperty(propertyId!, payload);
        alert('Property updated successfully!');
      } else {
        await propertyService.createProperty(payload);
        alert('Property created successfully!');
      }
      router.push('/profile/properties');
    } catch (err: any) {
      console.error('Error saving property:', err);
      const message =
        err?.response?.data?.error ||
        (err?.response?.status ? `Ошибка сервера: ${err.response.status}` : undefined) ||
        err?.message ||
        'Не удалось сохранить объявление';
      setError(`Ошибка: ${message}`);
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
        <BasicInfoSection formData={formData} onChange={handleInputChange} />
        <LocationSection
          formData={formData}
          onChange={handleInputChange}
          propertyTypes={propertyTypes}
          transactionTypes={transactionTypes}
          cities={cities}
          districts={districts}
          metroStations={metroStations}
        />
        <FeaturesSection formData={formData} onChange={handleInputChange} />
        <ImagesSection
          uploadedImageUrls={uploadedImageUrls}
          onUpload={handleImageUpload}
          onRemove={handleRemoveImage}
        />

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
