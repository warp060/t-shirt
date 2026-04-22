const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'API request failed');
        } else {
          const text = await response.text();
          console.error("Non-JSON Error Response:", text);
          if (response.status === 404) {
            throw new Error(`Endpoint ${endpoint} not found. Did you restart the server?`);
          }
          throw new Error(`Server error (${response.status}). Please check console for details.`);
        }
      }
      
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Backend server is not running. Please start it using "npm run dev".');
      }
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'API request failed');
        } else {
          const text = await response.text();
          console.error("Non-JSON Error Response:", text);
          if (response.status === 404) {
            throw new Error(`Endpoint ${endpoint} not found. Did you restart the server?`);
          }
          throw new Error(`Server error (${response.status}). Please check console for details.`);
        }
      }
      
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Backend server is not running. Please start it using "npm run dev".');
      }
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'API request failed');
        } else {
          const text = await response.text();
          console.error("Non-JSON Error Response:", text);
          throw new Error(`Server error (${response.status}). Please check console for details.`);
        }
      }
      
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Backend server is not running. Please start it using "npm run dev".');
      }
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'API request failed');
        } else {
          const text = await response.text();
          console.error("Non-JSON Error Response:", text);
          throw new Error(`Server error (${response.status}). Please check console for details.`);
        }
      }
      
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Backend server is not running. Please start it using "npm run dev".');
      }
      throw error;
    }
  },
};
