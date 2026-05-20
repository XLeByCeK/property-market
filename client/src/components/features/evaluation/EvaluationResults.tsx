import React from 'react';
import { useRouter } from 'next/router';
import { formatCurrency } from '../../../utils/formatters';
import { EvaluationOutput, PriceStatus } from './evaluatePrice';
import styles from './evaluate.module.css';

export type ResultsState =
  | { status: 'loading' }
  | { status: 'error' }
  | ({ status: 'success' } & EvaluationOutput);

interface PriceRangeProps {
  label: string;
  value: number;
  variant: 'low' | 'market' | 'high';
  isUserPrice: boolean;
}

const variantClass: Record<PriceRangeProps['variant'], string> = {
  low: styles.priceRangeLow,
  market: styles.priceRangeMarket,
  high: styles.priceRangeHigh,
};

const PriceRange: React.FC<PriceRangeProps> = ({ label, value, variant, isUserPrice }) => (
  <div className={`${styles.priceRange} ${variantClass[variant]}`}>
    <div className={styles.priceLabel}>{label}</div>
    <div className={styles.priceValue}>{formatCurrency(value)}</div>
    {isUserPrice && <div className={styles.yourPriceMarker}>Ваша цена</div>}
  </div>
);

interface EvaluationResultsProps {
  state: ResultsState;
}

export const EvaluationResults: React.FC<EvaluationResultsProps> = ({ state }) => {
  const router = useRouter();

  if (state.status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Анализируем данные рынка...</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.error}>
        <p>
          Произошла ошибка при оценке недвижимости. Пожалуйста, попробуйте снова или измените
          параметры поиска.
        </p>
      </div>
    );
  }

  const renderRange = (variant: PriceStatus, label: string, value: number) => (
    <PriceRange
      label={label}
      value={value}
      variant={variant}
      isUserPrice={state.priceStatus === variant}
    />
  );

  return (
    <div className={styles.results}>
      <h2>Оценка стоимости</h2>
      <p className={styles.note}>
        Оценка была сделана на основе {state.similarListings} похожих объявлений
      </p>

      <div className={styles.priceRanges}>
        {renderRange('low', 'Заниженная цена', state.lowPrice)}
        {renderRange('market', 'Рыночная цена', state.marketPrice)}
        {renderRange('high', 'Высокая цена', state.highPrice)}
      </div>

      <ul className={styles.benefitsList}>
        <li>
          <span className={styles.checkmark}>✓</span>
          Рыночная цена поможет продать недвижимость выгодно и уменьшить срок поиска покупателя
        </li>
        <li>
          <span className={styles.checkmark}>✓</span>
          Если укажете стоимость в пределах рыночной, в объявлении появится отметка{' '}
          <span className={styles.marketBadge}>Рыночная цена</span>
        </li>
      </ul>

      <button className={styles.listButton} onClick={() => router.push('/sell')}>
        Разместить объявление
      </button>
    </div>
  );
};
