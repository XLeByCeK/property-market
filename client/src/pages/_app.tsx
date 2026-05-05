import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import { CityProvider } from '../context/CityContext';
import { AuthProvider } from '../context/AuthContext';
import { AiAssistantProvider } from '../context/AiAssistantContext';

import { Layout } from '../components/layout/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <AuthProvider>
      <CityProvider>
        <AiAssistantProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AiAssistantProvider>
      </CityProvider>
    </AuthProvider>
  );
}

export default MyApp;
