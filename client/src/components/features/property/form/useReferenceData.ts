import { useEffect, useState } from 'react';
import * as propertyService from '../../../../services/propertyService';

export interface SelectOption {
  id: number;
  name: string;
}

interface UseReferenceDataResult {
  propertyTypes: SelectOption[];
  transactionTypes: SelectOption[];
  cities: SelectOption[];
  districts: SelectOption[];
  metroStations: SelectOption[];
  error: string | null;
}

/**
 * Загружает справочники для формы свойства: типы недвижимости, типы сделок,
 * города, а также районы/метро в зависимости от выбранного города.
 * Раньше эти три эффекта (init + districts + metro) жили внутри PropertyForm.
 */
export const useReferenceData = (cityId: number | undefined): UseReferenceDataResult => {
  const [propertyTypes, setPropertyTypes] = useState<SelectOption[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [metroStations, setMetroStations] = useState<SelectOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pt, tt, cs] = await Promise.all([
          propertyService.getPropertyTypes(),
          propertyService.getTransactionTypes(),
          propertyService.getCities(),
        ]);
        if (cancelled) return;
        setPropertyTypes(pt as SelectOption[]);
        setTransactionTypes(tt as SelectOption[]);
        setCities(cs as SelectOption[]);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        if (!cancelled) setError('Failed to load form data. Please try again later.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      setMetroStations([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [d, m] = await Promise.all([
          propertyService.getDistrictsByCityId(cityId),
          propertyService.getMetroStationsByCityId(cityId),
        ]);
        if (cancelled) return;
        setDistricts(d as SelectOption[]);
        setMetroStations(m as SelectOption[]);
      } catch (err) {
        console.error('Error fetching city-dependent data:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  return { propertyTypes, transactionTypes, cities, districts, metroStations, error };
};
