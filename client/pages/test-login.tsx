import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

const TestLoginPage: NextPage = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout, isAuthenticated, user, error } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    if (user) {
      addLog(`User: ${user.email} (${user.firstName} ${user.lastName})`);
    }
    if (error) {
      addLog(`Error: ${error}`);
    }
  }, [isAuthenticated, user, error]);

  const handleManualLogin = async () => {
    setIsLoading(true);
    addLog(`Attempting to log in with ${email}`);
    
    try {
      // Use fetch directly to bypass any potential middleware issues
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      addLog(`Login response status: ${response.status}`);
      
      const data = await response.json();
      addLog(`Login response data: ${JSON.stringify(data)}`);
      
      if (response.ok) {
        addLog('Login successful!');
        
        // Store the token and user data manually
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Force a page reload to update auth state
        window.location.reload();
      } else {
        addLog(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      addLog(`Error during login: ${error.message}`);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextLogin = async () => {
    setIsLoading(true);
    addLog(`Attempting to log in with AuthContext using ${email}`);
    
    try {
      await login(email, password);
      addLog('Login successful!');
    } catch (error: any) {
      addLog(`Error during login: ${error.message}`);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    addLog('Logging out...');
    
    try {
      await logout();
      addLog('Logout successful!');
    } catch (error: any) {
      addLog(`Error during logout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestUser = async () => {
    setIsLoading(true);
    addLog(`Creating test user with email: ${email}`);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          first_name: 'Test',
          last_name: 'User',
          role: 'BUYER'
        })
      });
      
      addLog(`Register response status: ${response.status}`);
      
      const data = await response.json();
      addLog(`Register response data: ${JSON.stringify(data)}`);
      
      if (response.ok) {
        addLog('User creation successful!');
        
        // Store the token and user data manually
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Force a page reload to update auth state
        window.location.reload();
      } else {
        addLog(`Error: ${data.error || 'Unknown error'}`);
        
        // If user already exists, we can still continue
        if (data.error && data.error.includes('already exists')) {
          addLog('User already exists, you can try logging in directly');
        }
      }
    } catch (error: any) {
      addLog(`Error during user creation: ${error.message}`);
      console.error('User creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <h1 className="text-2xl font-bold mb-4">Test Login</h1>
        
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
              {error && <p className="text-red-600 mt-2"><strong>Error:</strong> {error}</p>}
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Test Credentials</h2>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleManualLogin}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Manual Login (Direct Fetch)'}
            </button>
            
            <button
              onClick={handleContextLogin}
              disabled={isLoading}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Context Login'}
            </button>
            
            <button
              onClick={handleLogout}
              disabled={isLoading || !isAuthenticated}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Logout'}
            </button>
            
            <button
              onClick={handleCreateTestUser}
              disabled={isLoading}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Create Test User'}
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
            <p>No logs yet. Try logging in or out.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestLoginPage; 