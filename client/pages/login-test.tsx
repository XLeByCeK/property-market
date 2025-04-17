import React, { useState } from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/layout/Layout';
import { useRouter } from 'next/router';

const LoginTestPage: NextPage = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    addLog(`Attempting to log in with email: ${email}`);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      addLog(`Making request to: ${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      addLog(`Response status: ${response.status}`);
      
      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data)}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError(data.error || 'Invalid email or password');
          addLog(`Authentication error: ${data.error || 'Invalid email or password'}`);
        } else {
          setError(data.error || 'An error occurred during login');
          addLog(`Login error: ${data.error || 'An error occurred'}`);
        }
        return;
      }
      
      const { user, token } = data;
      
      if (!user || !token) {
        setError('Invalid response from server');
        addLog('Invalid server response - missing user or token');
        return;
      }
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      addLog('Login successful! Stored token and user data.');
      
      // Redirect after successful login
      const returnUrl = router.query.returnUrl as string || '/';
      addLog(`Redirecting to: ${returnUrl}`);
      
      // Force page reload to update auth state
      window.location.href = returnUrl;
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Connection error. Please try again later.');
      addLog(`Error during login: ${error.message}`);
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
        <h1 className="text-2xl font-bold mb-4">Login Test</h1>
        
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <form onSubmit={handleLogin} className="mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <button
            onClick={clearLogs}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
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
            <p>No logs yet. Try logging in.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoginTestPage; 