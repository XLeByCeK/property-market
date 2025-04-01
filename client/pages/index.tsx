import React from 'react';
import { Layout } from '../components/layout/Layout';
import { SearchBanner } from '../components/layout/SearchBanner/SearchBanner';
import { PropertyCategory } from '../components/category/PropertyCategory';
import { newBuildings, forSale, forRent } from '../data/mockProperties';

export default function Home() {
  return (
    <Layout>
      <SearchBanner selectedCity="Москве" backgroundImage="/images/banner-bg.jpg" />
      
      <main className="container">
        <PropertyCategory 
          title="Новостройки" 
          properties={newBuildings}
          link="/new-buildings"
        />
        
        <PropertyCategory 
          title="Купить" 
          properties={forSale}
          link="/buy"
        />
        
        <PropertyCategory 
          title="Снять" 
          properties={forRent}
          link="/rent"
        />
      </main>
    </Layout>
  );
} 