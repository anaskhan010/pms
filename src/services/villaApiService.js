import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Use the same token key as the main auth system
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const villaApiService = {
  // Get all villas
  getVillas: async (params = {}) => {
    try {
      const response = await api.get('/villas/getVillas', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get villa by ID
  getVillaById: async (id) => {
    try {
      const response = await api.get(`/villas/getVilla/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new villa
  createVilla: async (villaData) => {
    try {
      const formData = new FormData();
      
      // Add villa data
      Object.keys(villaData).forEach(key => {
        if (key === 'images') {
          // Handle multiple images
          if (villaData.images && villaData.images.length > 0) {
            villaData.images.forEach(image => {
              formData.append('images', image);
            });
          }
        } else if (key === 'features') {
          // Handle features array
          formData.append('features', JSON.stringify(villaData.features));
        } else {
          formData.append(key, villaData[key]);
        }
      });

      const response = await api.post('/villas/createVilla', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update villa
  updateVilla: async (id, villaData) => {
    try {
      const formData = new FormData();
      
      // Add villa data
      Object.keys(villaData).forEach(key => {
        if (key === 'images') {
          // Handle multiple images
          if (villaData.images && villaData.images.length > 0) {
            villaData.images.forEach(image => {
              formData.append('images', image);
            });
          }
        } else if (key === 'features') {
          // Handle features array
          formData.append('features', JSON.stringify(villaData.features));
        } else {
          formData.append(key, villaData[key]);
        }
      });

      const response = await api.put(`/villas/updateVilla/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete villa
  deleteVilla: async (id) => {
    try {
      const response = await api.delete(`/villas/deleteVilla/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add villa image
  addVillaImage: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`/villas/addVillaImage/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add multiple villa images
  addVillaImages: async (id, formData) => {
    try {
      const response = await api.post(`/villas/addVillaImage/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get villa images
  getVillaImages: async (id) => {
    try {
      const response = await api.get(`/villas/getVillaImages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete villa image
  deleteVillaImage: async (villaId, imageId) => {
    try {
      const response = await api.delete(`/villas/deleteVillaImage/${villaId}/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete villa image
  deleteVillaImage: async (villaId, imageId) => {
    try {
      const response = await api.delete(`/villas/deleteVillaImage/${villaId}/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get villa statistics
  getVillaStatistics: async () => {
    try {
      const response = await api.get('/villas/getVillaStatistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default villaApiService;
