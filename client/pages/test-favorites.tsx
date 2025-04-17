import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/layout/Layout';
import { toggleFavorite, getFavoriteProperties, isPropertyFavorited } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';

const TestFavoritesPage: NextPage = () => {
  const [testPropertyId, setTestPropertyId] = useState('1');
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  useEffect(() => {
    addLog(`Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    if (user) {
      addLog(`User: ID=${user.id}, ${user.firstName} ${user.lastName}`);
    }
    addLog(`Token exists: ${localStorage.getItem('token') ? 'Yes' : 'No'}`);
  }, [isAuthenticated, user]);

  const handleTestToggleFavorite = async () => {
    addLog(`Testing toggle favorite for property ID: ${testPropertyId}`);
    setIsLoading(true);
    
    try {
      const numericId = parseInt(testPropertyId, 10);
      if (isNaN(numericId)) {
        addLog('Error: Invalid property ID');
        return;
      }
      
      addLog('Making API call to toggle favorite...');
      const result = await toggleFavorite(numericId);
      addLog(`Toggle result: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      if (error.response) {
        addLog(`Status: ${error.response.status}`);
        addLog(`Data: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestGetFavorites = async () => {
    addLog('Testing get favorites...');
    setIsLoading(true);
    
    try {
      addLog('Making API call to get favorites...');
      const favorites = await getFavoriteProperties();
      addLog(`Got ${favorites.length} favorites`);
      favorites.forEach((fav, index) => {
        addLog(`${index + 1}. ID: ${fav.id}, Type: ${fav.propertyType}, Price: ${fav.price}`);
      });
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      if (error.response) {
        addLog(`Status: ${error.response.status}`);
        addLog(`Data: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestIsPropertyFavorited = async () => {
    addLog(`Testing is property favorited for ID: ${testPropertyId}`);
    setIsLoading(true);
    
    try {
      const numericId = parseInt(testPropertyId, 10);
      if (isNaN(numericId)) {
        addLog('Error: Invalid property ID');
        return;
      }
      
      addLog('Making API call to check if property is favorited...');
      const isFavorited = await isPropertyFavorited(numericId);
      addLog(`Result: Property is ${isFavorited ? 'favorited' : 'not favorited'}`);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      if (error.response) {
        addLog(`Status: ${error.response.status}`);
        addLog(`Data: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4" style={{ paddingTop: '6rem' }}>
        <h1 className="text-2xl font-bold mb-4">Test Favorites API</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 items-center">
            <label htmlFor="propertyId" className="font-medium">Property ID:</label>
            <input 
              id="propertyId"
              type="text" 
              value={testPropertyId} 
              onChange={(e) => setTestPropertyId(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          
          <button 
            onClick={handleTestToggleFavorite}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Working...' : 'Test Toggle Favorite'}
          </button>
          
          <button 
            onClick={handleTestGetFavorites}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Working...' : 'Test Get Favorites'}
          </button>
          
          <button 
            onClick={handleTestIsPropertyFavorited}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Working...' : 'Test Is Favorited'}
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
          <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono">
            {log.length > 0 ? (
              log.map((entry, index) => (
                <div key={index} className="mb-1">
                  {entry}
                </div>
              ))
            ) : (
              <div>No log entries yet. Click one of the test buttons.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestFavoritesPage; 