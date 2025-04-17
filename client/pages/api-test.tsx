import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

const ApiTestPage: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    if (user) {
      addLog(`User: ${user.email} (${user.firstName} ${user.lastName})`);
    }
  }, [isAuthenticated, user]);

  const makeAuthenticatedRequest = async (url: string, method: string = 'GET', body?: any) => {
    setIsLoading(true);
    addLog(`Making ${method} request to ${url}`);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addLog('No authentication token found. Please login first.');
        return;
      }
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${url}`, options);
      addLog(`Response status: ${response.status}`);
      
      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`);
      
      return data;
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      console.error('API request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetFavorites = () => {
    return makeAuthenticatedRequest('/properties/favorites');
  };

  const testToggleFavorite = (propertyId: number) => {
    return makeAuthenticatedRequest(`/properties/favorites/${propertyId}`, 'POST');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
            <div className={`p-2 rounded ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
              {isAuthenticated ? (
                <div>
                  <p><strong>Status:</strong> Authenticated</p>
                  {user && (
                    <>
                      <p><strong>User ID:</strong> {user.id}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                    </>
                  )}
                </div>
              ) : (
                <p><strong>Status:</strong> Not authenticated</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testGetFavorites}
              disabled={isLoading || !isAuthenticated}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Get Favorites'}
            </button>
            
            <button
              onClick={() => testToggleFavorite(1)}
              disabled={isLoading || !isAuthenticated}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Toggle Favorite (ID: 1)'}
            </button>
            
            <button
              onClick={() => testToggleFavorite(2)}
              disabled={isLoading || !isAuthenticated}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Toggle Favorite (ID: 2)'}
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        <div className="bg-black rounded p-4 text-green-400 font-mono h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2 text-white">Logs</h2>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          ) : (
            <p>No logs yet. Try making an API request.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApiTestPage; 