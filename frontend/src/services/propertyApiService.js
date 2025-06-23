import api from "./api";

/**
 * Property API Service
 * Handles all property-related API calls to the backend
 */
export const propertyApiService = {
  /**
   * Create a new property
   * @param {Object} propertyData - Property data to create
   * @returns {Promise<Object>} API response
   */
  async createProperty(propertyData) {
    try {
      const response = await api.post(
        "/properties/create-property",
        propertyData
      );
      return {
        success: true,
        data: response.data.data,
        message: "Property created successfully",
      };
    } catch (error) {
      console.error("Error creating property:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create property",
      };
    }
  },

  /**
   * Get all properties
   * @param {Object} params - Query parameters (page, limit, filters)
   * @returns {Promise<Object>} API response
   */
  async getProperties(params = {}) {
    try {
      const response = await api.get("/properties/get-all-properties", {
        params,
      });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.count,
      };
    } catch (error) {
      console.error("Error fetching properties:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch properties",
      };
    }
  },

  /**
   * Get a single property by ID
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} API response
   */
  async getProperty(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching property:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch property",
      };
    }
  },

  /**
   * Update a property
   * @param {string} propertyId - Property ID
   * @param {Object} propertyData - Updated property data
   * @returns {Promise<Object>} API response
   */
  async updateProperty(propertyId, propertyData) {
    try {
      const response = await api.put(`/properties/${propertyId}`, propertyData);
      return {
        success: true,
        data: response.data.data,
        message: "Property updated successfully",
      };
    } catch (error) {
      console.error("Error updating property:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update property",
      };
    }
  },

  /**
   * Delete a property
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} API response
   */
  async deleteProperty(propertyId) {
    try {
      await api.delete(`/properties/${propertyId}`);
      return {
        success: true,
        message: "Property deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting property:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete property",
      };
    }
  },

  /**
   * Get property units
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} API response
   */
  async getPropertyUnits(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}/units`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching property units:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch property units",
      };
    }
  },

  /**
   * Get property statistics
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} API response
   */
  async getPropertyStatistics(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}/statistics`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching property statistics:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch property statistics",
      };
    }
  },
};

export default propertyApiService;
