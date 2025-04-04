import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { CityProvider } from '../context/CityContext';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Import bootstrap JavaScript only on the client side
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <AuthProvider>
      <CityProvider>
        <Component {...pageProps} />
      </CityProvider>
    </AuthProvider>
  );
}

export default MyApp; 