import React, { useState } from 'react';
import styles from './evaluate.module.css';

export interface EvaluationFormValues {
  propertyType: string;
  rooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  address: string;
  price: string;
}

interface EvaluationFormProps {
  onSubmit: (values: EvaluationFormValues) => void;
}

const PROPERTY_TYPES = [
  { value: 'квартира', label: 'Квартира' },
  { value: 'дом', label: 'Дом' },
  { value: 'таунхаус', label: 'Таунхаус' },
  { value: 'вилла', label: 'Вилла' },
];

const ROOM_OPTIONS = [
  { value: 'studio', label: 'Студия' },
  { value: '1', label: '1 комната' },
  { value: '2', label: '2 комнаты' },
  { value: '3', label: '3 комнаты' },
  { value: '4+', label: '4+ комнаты' },
];

const initialValues: EvaluationFormValues = {
  propertyType: '',
  rooms: '',
  area: '',
  floor: '',
  totalFloors: '',
  address: '',
  price: '',
};

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSubmit }) => {
  const [values, setValues] = useState<EvaluationFormValues>(initialValues);

  const update = <K extends keyof EvaluationFormValues>(key: K, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <select
          value={values.propertyType}
          onChange={(e) => update('propertyType', e.target.value)}
          required
        >
          <option value="">Тип недвижимости</option>
          {PROPERTY_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <select
          value={values.rooms}
          onChange={(e) => update('rooms', e.target.value)}
          required
        >
          <option value="">Количество комнат</option>
          {ROOM_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <input
          type="number"
          placeholder="Площадь, м²"
          value={values.area}
          onChange={(e) => update('area', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRowDouble}>
        <input
          type="number"
          placeholder="Этаж"
          value={values.floor}
          onChange={(e) => update('floor', e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Этажей в доме"
          value={values.totalFloors}
          onChange={(e) => update('totalFloors', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <input
          type="text"
          placeholder="Адрес"
          value={values.address}
          onChange={(e) => update('address', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <input
          type="number"
          placeholder="Ваша цена, ₽"
          value={values.price}
          onChange={(e) => update('price', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <button type="submit" className={styles.evaluateButton}>
          Рассчитать цену
        </button>
      </div>
    </form>
  );
};
