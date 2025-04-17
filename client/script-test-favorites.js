const testFavoritesAPI = async () => {
  try {
    // Get token from localStorage if running in browser
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    
    console.log('Using token:', token.substring(0, 15) + '...');
    
    const response = await fetch('http://localhost:3001/api/properties/favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} favorites`);
      
      if (data.length > 0) {
        console.log('First favorite:', {
          id: data[0].id,
          title: data[0].title,
          price: data[0].price
        });
      }
    } else {
      console.error('Unexpected response format:', data);
    }
  } catch (error) {
    console.error('Error testing favorites API:', error);
  }
};

// Run the test if in browser environment
if (typeof window !== 'undefined') {
  console.log('Running test...');
  testFavoritesAPI();
} else {
  console.log('This script should be run in browser');
}

// Export for importing in browser console
if (typeof module !== 'undefined') {
  module.exports = { testFavoritesAPI };
} 