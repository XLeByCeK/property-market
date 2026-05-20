import { useEffect, useState } from 'react';
import {
  getCities,
  getDistrictsByCityId,
  getMetroStationsByCityId,
  getPropertyTypes,
  getTransactionTypes,
} from '../../../services/propertyService';

export interface NamedEntity {
  id: number;
  name: string;
}

export interface MetroStation extends NamedEntity {
  color?: string;
}

interface UseSearchBannerDataResult {
  propertyTypes: NamedEntity[];
  transactionTypes: NamedEntity[];
  cities: NamedEntity[];
  districts: NamedEntity[];
  metroStations: MetroStation[];
}

/**
 * Загружает справочники, нужные баннеру поиска: типы недвижимости, типы сделок,
 * города, а также районы/метро по выбранному городу. Логика дублировалась внутри
 * `SearchBanner.tsx` и `PropertyForm.tsx`.
 */
export const useSearchBannerData = (selectedCityId: string): UseSearchBannerDataResult => {
  const [propertyTypes, setPropertyTypes] = useState<NamedEntity[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<NamedEntity[]>([]);
  const [cities, setCities] = useState<NamedEntity[]>([]);
  const [districts, setDistricts] = useState<NamedEntity[]>([]);
  const [metroStations, setMetroStations] = useState<MetroStation[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pt, tt, cs] = await Promise.all([
          getPropertyTypes(),
          getTransactionTypes(),
          getCities(),
        ]);
        if (cancelled) return;
        setPropertyTypes((pt as NamedEntity[]) || []);
        setTransactionTypes((tt as NamedEntity[]) || []);
        setCities((cs as NamedEntity[]) || []);
      } catch (err) {
        console.error('Error loading search banner data:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      setMetroStations([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const cityId = parseInt(selectedCityId, 10);
        const [d, m] = await Promise.all([
          getDistrictsByCityId(cityId),
          getMetroStationsByCityId(cityId),
        ]);
        if (cancelled) return;
        setDistricts((d as NamedEntity[]) || []);
        setMetroStations((m as MetroStation[]) || []);
      } catch (err) {
        console.error('Error loading city data:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCityId]);

  return { propertyTypes, transactionTypes, cities, districts, metroStations };
};
