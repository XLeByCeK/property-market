import React, { useState } from 'react';
import Image from 'next/image';
import { Layout } from '../components/layout/Layout';
import { BANNER_BG_IMAGE } from '../utils/imageUrl';
import {
  EvaluationForm,
  EvaluationFormValues,
} from '../components/features/evaluation/EvaluationForm';
import {
  EvaluationResults,
  ResultsState,
} from '../components/features/evaluation/EvaluationResults';
import { evaluatePrice } from '../components/features/evaluation/evaluatePrice';
import styles from '../components/features/evaluation/evaluate.module.css';

const PropertyEvaluationPage: React.FC = () => {
  const [state, setState] = useState<ResultsState | null>(null);

  const handleEvaluate = async (values: EvaluationFormValues) => {
    setState({ status: 'loading' });
    try {
      const result = await evaluatePrice({
        propertyType: values.propertyType,
        rooms: values.rooms,
        userPrice: parseInt(values.price, 10) || 0,
      });
      setState({ status: 'success', ...result });
    } catch (error) {
      console.error('Error evaluating property:', error);
      setState({ status: 'error' });
    }
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <div className={styles.imageContainer}>
                <Image
                  src={BANNER_BG_IMAGE}
                  alt="Property evaluation"
                  width={700}
                  height={600}
                  priority
                  className={styles.image}
                />
              </div>

              <div className={styles.formContainer}>
                <h1>Оценка стоимости недвижимости</h1>
                <p>Заполните параметры объекта для точной оценки</p>
                <EvaluationForm onSubmit={handleEvaluate} />
              </div>
            </div>
          </div>

          {state && (
            <>
              <div className={styles.separator}></div>
              <EvaluationResults state={state} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PropertyEvaluationPage;
