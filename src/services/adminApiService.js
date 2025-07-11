import api from "./api";

/**
 * Admin API Service
 * Comprehensive service for all admin operations with exact backend API mapping
 */
export const adminApiService = {
  // ==================== PROPERTIES API ====================

  /**
   * Get all properties with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getProperties(params = {}) {
    try {
      const response = await api.get("/properties/get-all-properties", {
        params,
      });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching properties:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch properties",
        data: [],
      };
    }
  },

  /**
   * Get single property by ID
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
   * Create new property
   * @param {Object} propertyData - Property data
   * @returns {Promise<Object>} API response
   */
  async createProperty(propertyData) {
    try {
      const response = await api.post("/properties/create-property", propertyData);
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
   * Update property
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
   * Delete property
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} API response
   */
  async deleteProperty(propertyId) {
    try {
      const response = await api.delete(`/properties/${propertyId}`);
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
   * Get property statistics
   * @returns {Promise<Object>} API response
   */
  async getPropertyStatistics() {
    try {
      const response = await api.get("/properties/statistics");
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
        data: {
          totalProperties: 0,
          occupiedProperties: 0,
          vacantProperties: 0,
          maintenanceProperties: 0,
          totalRevenue: 0,
          averageRent: 0,
        },
      };
    }
  },

  /**
   * Bulk property operations
   * @param {Object} operationData - Operation data
   * @returns {Promise<Object>} API response
   */
  async bulkPropertyOperations(operationData) {
    try {
      const response = await api.post("/properties/bulk", operationData);
      return {
        success: true,
        data: response.data.data,
        message: "Bulk operation completed successfully",
      };
    } catch (error) {
      console.error("Error performing bulk property operations:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to perform bulk operations",
      };
    }
  },

  /**
   * Export properties to CSV
   * @param {Object} filters - Export filters
   * @returns {Promise<Object>} API response
   */
  async exportProperties(filters = {}) {
    try {
      const response = await api.get("/properties/export", {
        params: filters,
        responseType: "blob",
      });
      return {
        success: true,
        data: response.data,
        message: "Properties exported successfully",
      };
    } catch (error) {
      console.error("Error exporting properties:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to export properties",
      };
    }
  },

  // ==================== UNITS API ====================

  /**
   * Get all units with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getUnits(params = {}) {
    try {
      const response = await api.get("/units/get-all-units", { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching units:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch units",
        data: [],
      };
    }
  },

  /**
   * Get single unit by ID
   * @param {string} unitId - Unit ID
   * @returns {Promise<Object>} API response
   */
  async getUnit(unitId) {
    try {
      const response = await api.get(`/units/${unitId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching unit:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch unit",
      };
    }
  },

  /**
   * Create new unit
   * @param {Object} unitData - Unit data
   * @returns {Promise<Object>} API response
   */
  async createUnit(unitData) {
    try {
      const response = await api.post("/units/create-unit", unitData);
      return {
        success: true,
        data: response.data.data,
        message: "Unit created successfully",
      };
    } catch (error) {
      console.error("Error creating unit:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create unit",
      };
    }
  },

  // ==================== TENANTS API ====================

  /**
   * Get all tenants with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getTenants(params = {}) {
    try {
      const response = await api.get("/tenants", { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.total || response.data.count || 0,
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error("Error fetching tenants:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch tenants",
        data: [],
      };
    }
  },

  /**
   * Get single tenant by ID
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} API response
   */
  async getTenant(tenantId) {
    try {
      const response = await api.get(`/tenants/${tenantId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching tenant:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch tenant",
      };
    }
  },

  /**
   * Create new tenant with multiple table insertions
   * @param {Object} tenantData - Tenant data
   * @returns {Promise<Object>} API response
   */
  async createTenant(tenantData) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add all tenant data to FormData
      Object.keys(tenantData).forEach(key => {
        if (tenantData[key] !== null && tenantData[key] !== undefined) {
          if (key === 'ejariDocument' && tenantData[key] instanceof File) {
            formData.append('ejariDocument', tenantData[key]);
          } else if (key === 'image' && tenantData[key] instanceof File) {
            formData.append('image', tenantData[key]);
          } else {
            formData.append(key, tenantData[key]);
          }
        }
      });

      const response = await api.post("/tenants/create-tenant", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Tenant created successfully"
      };
    } catch (error) {
      console.error("Error creating tenant:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create tenant",
        details: error.response?.data?.details || []
      };
    }
  },

  /**
   * Update tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} tenantData - Updated tenant data
   * @returns {Promise<Object>} API response
   */
  async updateTenant(tenantId, tenantData) {
    try {
      const response = await api.put(`/tenants/${tenantId}`, tenantData);
      return {
        success: true,
        data: response.data.data,
        message: "Tenant updated successfully",
      };
    } catch (error) {
      console.error("Error updating tenant:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update tenant",
      };
    }
  },

  /**
   * Update tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} tenantData - Updated tenant data
   * @returns {Promise<Object>} API response
   */
  async updateTenant(tenantId, tenantData) {
    try {
      const formData = new FormData();

      // Add tenant fields
      if (tenantData.firstName) formData.append('firstName', tenantData.firstName);
      if (tenantData.lastName) formData.append('lastName', tenantData.lastName);
      if (tenantData.email) formData.append('email', tenantData.email);
      if (tenantData.phoneNumber) formData.append('phoneNumber', tenantData.phoneNumber);
      if (tenantData.address) formData.append('address', tenantData.address);
      if (tenantData.gender) formData.append('gender', tenantData.gender);
      if (tenantData.nationality) formData.append('nationality', tenantData.nationality);
      if (tenantData.dateOfBirth) formData.append('dateOfBirth', tenantData.dateOfBirth);
      if (tenantData.occupation) formData.append('occupation', tenantData.occupation);
      if (tenantData.registrationNumber) formData.append('registrationNumber', tenantData.registrationNumber);
      if (tenantData.registrationExpiry) formData.append('registrationExpiry', tenantData.registrationExpiry);

      const response = await api.put(`/tenants/updateTenant/${tenantId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || "Tenant updated successfully"
      };
    } catch (error) {
      console.error("Error updating tenant:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to update tenant"
      };
    }
  },

  /**
   * Delete tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} API response
   */
  async deleteTenant(tenantId) {
    try {
      await api.delete(`/tenants/${tenantId}`);
      return {
        success: true,
        message: "Tenant deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting tenant:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete tenant",
      };
    }
  },

  /**
   * Get tenant contracts
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} API response
   */
  async getTenantContracts(tenantId) {
    try {
      const response = await api.get(`/tenants/${tenantId}/contracts`);
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0
      };
    } catch (error) {
      console.error("Error fetching tenant contracts:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch tenant contracts",
        data: []
      };
    }
  },

  /**
   * Get tenant statistics
   * @returns {Promise<Object>} API response
   */
  async getTenantStatistics() {
    try {
      const response = await api.get("/tenants/statistics");
      return {
        success: true,
        data: response.data.data,
        generatedAt: response.data.generatedAt
      };
    } catch (error) {
      console.error("Error fetching tenant statistics:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch tenant statistics",
        data: null
      };
    }
  },

  /**
   * Bulk operations on tenants
   * @param {Object} operationData - Bulk operation data
   * @returns {Promise<Object>} API response
   */
  async bulkTenantOperations(operationData) {
    try {
      const response = await api.post("/tenants/bulk", operationData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error("Error performing bulk tenant operation:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to perform bulk operation",
        details: error.response?.data?.details || []
      };
    }
  },

  /**
   * Get all buildings
   * @returns {Promise<Object>} API response
   */
  async getBuildings() {
    try {
      const response = await api.get("/buildings/getBuildings");
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching buildings:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch buildings",
        data: []
      };
    }
  },

  /**
   * Get building by ID
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} API response
   */
  async getBuildingById(buildingId) {
    try {
      const response = await api.get(`/buildings/getBuilding/${buildingId}`);
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching building:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch building",
        data: {}
      };
    }
  },

  /**
   * Get comprehensive building details with floors and apartments for editing
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} API response
   */
  async getComprehensiveBuildingById(buildingId) {
    try {
      const response = await api.get(`/buildings/getComprehensiveBuilding/${buildingId}`);
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching comprehensive building details:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch comprehensive building details",
        data: {}
      };
    }
  },

  /**
   * Create new building
   * @param {Object} buildingData - Building data
   * @param {Array} images - Building images
   * @returns {Promise<Object>} API response
   */
  async createBuilding(buildingData, images = []) {
    try {
      const formData = new FormData();
      formData.append('buildingName', buildingData.buildingName);
      formData.append('buildingAddress', buildingData.buildingAddress);

      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post("/buildings/createBuilding", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error creating building:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to create building",
        data: {}
      };
    }
  },

  /**
   * Create comprehensive building with floors and apartments
   * @param {Object} comprehensiveData - Complete building data with floors and apartments
   * @returns {Promise<Object>} API response
   */
  async createComprehensiveBuilding(comprehensiveData) {
    try {
      const formData = new FormData();

      // Add building data
      formData.append('buildingData', JSON.stringify({
        buildingName: comprehensiveData.buildingName,
        buildingAddress: comprehensiveData.buildingAddress
      }));

      // Add floors data
      formData.append('floorsData', JSON.stringify(comprehensiveData.floors));

      // Add apartments data
      formData.append('apartmentsData', JSON.stringify(comprehensiveData.apartments));

      // Add building images
      if (comprehensiveData.buildingImages && comprehensiveData.buildingImages.length > 0) {
        comprehensiveData.buildingImages.forEach((image) => {
          formData.append('buildingImages', image);
        });
      }

      // Floor images are no longer needed - floors are just names

      // Add apartment images
      comprehensiveData.apartments.forEach((apartment) => {
        if (apartment.apartmentImages && apartment.apartmentImages.length > 0) {
          apartment.apartmentImages.forEach((image) => {
            formData.append(`apartmentImages_${apartment.id}`, image);
          });
        }
      });

      const response = await api.post("/buildings/createComprehensiveBuilding", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error creating comprehensive building:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to create comprehensive building",
        data: {}
      };
    }
  },

  /**
   * Update building
   * @param {number} buildingId - Building ID
   * @param {Object} buildingData - Building data
   * @param {Array} images - New building images
   * @returns {Promise<Object>} API response
   */
  async updateBuilding(buildingId, buildingData, images = []) {
    try {
      const formData = new FormData();
      if (buildingData.buildingName) formData.append('buildingName', buildingData.buildingName);
      if (buildingData.buildingAddress) formData.append('buildingAddress', buildingData.buildingAddress);

      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.put(`/buildings/updateBuilding/${buildingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error updating building:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to update building",
        data: {}
      };
    }
  },

  /**
   * Update comprehensive building with floors and apartments
   * @param {number} buildingId - Building ID
   * @param {Object} buildingData - Complete building data
   * @returns {Promise<Object>} API response
   */
  async updateComprehensiveBuilding(buildingId, buildingData) {
    try {
      const formData = new FormData();

      // Add building data
      formData.append('buildingData', JSON.stringify({
        buildingName: buildingData.buildingName,
        buildingAddress: buildingData.buildingAddress
      }));

      // Add floors data
      formData.append('floorsData', JSON.stringify(buildingData.floors));

      // Add apartments data
      formData.append('apartmentsData', JSON.stringify(buildingData.apartments));

      // Add building images
      if (buildingData.buildingImages && buildingData.buildingImages.length > 0) {
        buildingData.buildingImages.forEach((image) => {
          formData.append('buildingImages', image);
        });
      }

      // Add apartment images
      if (buildingData.apartments && buildingData.apartments.length > 0) {
        buildingData.apartments.forEach((apartment) => {
          if (apartment.apartmentImages && apartment.apartmentImages.length > 0) {
            apartment.apartmentImages.forEach((image) => {
              formData.append(`apartmentImages_${apartment.id}`, image);
            });
          }
        });
      }

      const response = await api.put(`/buildings/updateComprehensiveBuilding/${buildingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error updating comprehensive building:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to update comprehensive building",
        data: {}
      };
    }
  },

  /**
   * Delete building
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} API response
   */
  async deleteBuilding(buildingId) {
    try {
      const response = await api.delete(`/buildings/deleteBuilding/${buildingId}`);
      return {
        success: true,
        message: response.data.message || "Building deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting building:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to delete building"
      };
    }
  },

  /**
   * Get all buildings for tenant creation (backward compatibility)
   * @returns {Promise<Object>} API response
   */
  async getBuildingsForTenants() {
    try {
      const response = await api.get("/tenants/buildings");
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching buildings for tenants:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch buildings",
        data: []
      };
    }
  },

  /**
   * Get floors by building ID
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} API response
   */
  async getFloorsByBuilding(buildingId) {
    try {
      const response = await api.get(`/buildings/getBuildingFloors/${buildingId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      // Fallback to tenant route for backward compatibility
      try {
        const fallbackResponse = await api.get(`/tenants/buildings/${buildingId}/floors`);
        return {
          success: true,
          data: fallbackResponse.data.data || []
        };
      } catch (fallbackError) {
        console.error("Error fetching floors by building:", fallbackError);
        return {
          success: false,
          error: fallbackError.response?.data?.error || fallbackError.message || "Failed to fetch floors",
          data: []
        };
      }
    }
  },

  /**
   * Get apartments by floor ID
   * @param {number} floorId - Floor ID
   * @returns {Promise<Object>} API response
   */
  async getApartmentsByFloor(floorId) {
    try {
      const response = await api.get(`/apartments/getApartments?floorId=${floorId}&limit=100`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching apartments:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch apartments",
        data: []
      };
    }
  },

  /**
   * Get apartment by ID
   * @param {number} apartmentId - Apartment ID
   * @returns {Promise<Object>} API response
   */
  async getApartment(apartmentId) {
    try {
      const response = await api.get(`/apartments/getApartment/${apartmentId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error("Error fetching apartment:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch apartment",
      };
    }
  },

  /**
   * Get all apartments
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getApartments(params = {}) {
    try {
      const response = await api.get("/apartments/getApartments", { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.total || response.data.count || 0
      };
    } catch (error) {
      console.error("Error fetching apartments:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch apartments",
        data: []
      };
    }
  },

  /**
   * Get all available apartments
   * @returns {Promise<Object>} API response
   */
  async getAvailableApartments() {
    try {
      const response = await api.get("/tenants/available-apartments");
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching available apartments:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch available apartments",
        data: []
      };
    }
  },

  /**
   * Get available tenants for apartment assignment
   * @returns {Promise<Object>} API response
   */
  async getAvailableTenantsForAssignment() {
    try {
      const response = await api.get("/tenants/available-for-assignment");
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching available tenants:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch available tenants",
        data: []
      };
    }
  },

  /**
   * Assign apartment to tenant with contract creation
   * @param {string} tenantId - Tenant ID
   * @param {string} apartmentId - Apartment ID
   * @param {Object} contractData - Contract details
   * @returns {Promise<Object>} API response
   */
  async assignApartmentToTenant(tenantId, apartmentId, contractData) {
    try {
      const response = await api.post(`/tenants/${tenantId}/apartments/${apartmentId}`, contractData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Apartment assigned successfully"
      };
    } catch (error) {
      console.error("Error assigning apartment:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to assign apartment"
      };
    }
  },

  /**
   * Remove apartment assignment from tenant
   * @param {string} tenantId - Tenant ID
   * @param {string} apartmentId - Apartment ID
   * @returns {Promise<Object>} API response
   */
  async removeApartmentAssignment(tenantId, apartmentId) {
    try {
      const response = await api.delete(`/tenants/${tenantId}/apartments/${apartmentId}`);
      return {
        success: true,
        data: response.data.data,
        message: "Apartment assignment removed successfully"
      };
    } catch (error) {
      console.error("Error removing apartment assignment:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to remove apartment assignment"
      };
    }
  },

  /**
   * Get apartment statistics
   * @returns {Promise<Object>} API response
   */
  async getApartmentStatistics() {
    try {
      const response = await api.get("/apartments/getApartmentStatistics");
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching apartment statistics:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch apartment statistics",
        data: {}
      };
    }
  },

  /**
   * Create new apartment
   * @param {Object} apartmentData - Apartment data
   * @param {Array} images - Apartment images
   * @returns {Promise<Object>} API response
   */
  async createApartment(apartmentData, images = []) {
    try {
      const formData = new FormData();
      formData.append('floorId', apartmentData.floorId);
      formData.append('bedrooms', apartmentData.bedrooms);
      formData.append('bathrooms', apartmentData.bathrooms);
      formData.append('length', apartmentData.length);
      formData.append('width', apartmentData.width);
      formData.append('rentPrice', apartmentData.rentPrice);

      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post("/apartments/createApartment", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error creating apartment:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to create apartment",
        data: {}
      };
    }
  },

  /**
   * Update apartment
   * @param {number} apartmentId - Apartment ID
   * @param {Object} apartmentData - Apartment data
   * @param {Array} images - New apartment images
   * @returns {Promise<Object>} API response
   */
  async updateApartment(apartmentId, apartmentData, images = []) {
    try {
      const formData = new FormData();
      if (apartmentData.bedrooms) formData.append('bedrooms', apartmentData.bedrooms);
      if (apartmentData.bathrooms) formData.append('bathrooms', apartmentData.bathrooms);
      if (apartmentData.length) formData.append('length', apartmentData.length);
      if (apartmentData.width) formData.append('width', apartmentData.width);
      if (apartmentData.rentPrice) formData.append('rentPrice', apartmentData.rentPrice);

      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.put(`/apartments/updateApartment/${apartmentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error updating apartment:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to update apartment",
        data: {}
      };
    }
  },

  /**
   * Delete apartment
   * @param {number} apartmentId - Apartment ID
   * @returns {Promise<Object>} API response
   */
  async deleteApartment(apartmentId) {
    try {
      const response = await api.delete(`/apartments/deleteApartment/${apartmentId}`);
      return {
        success: true,
        message: response.data.message || "Apartment deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting apartment:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to delete apartment"
      };
    }
  },

  // ==================== FLOOR API ====================

  /**
   * Get all floors
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getFloors(params = {}) {
    try {
      const response = await api.get("/floors/getFloors", { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.total || response.data.count || 0
      };
    } catch (error) {
      console.error("Error fetching floors:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch floors",
        data: []
      };
    }
  },

  /**
   * Get floor by ID
   * @param {number} floorId - Floor ID
   * @returns {Promise<Object>} API response
   */
  async getFloor(floorId) {
    try {
      const response = await api.get(`/floors/getFloor/${floorId}`);
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching floor:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch floor",
        data: {}
      };
    }
  },

  /**
   * Create new floor
   * @param {Object} floorData - Floor data
   * @param {Array} images - Floor images
   * @returns {Promise<Object>} API response
   */
  async createFloor(floorData, images = []) {
    try {
      const formData = new FormData();
      formData.append('buildingId', floorData.buildingId);
      formData.append('floorName', floorData.floorName);

      // Add images if provided
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post("/floors/createFloor", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error creating floor:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to create floor",
        data: {}
      };
    }
  },

  // ==================== PAYMENTS API ====================

  /**
   * Get tenant payment statistics
   * @param {number} tenantId - Tenant ID
   * @param {number} year - Year (optional)
   * @returns {Promise<Object>} API response
   */
  async getTenantPaymentStats(tenantId, year = null) {
    try {
      const params = year ? { year } : {};
      const response = await api.get(`/payments/tenant/${tenantId}/stats`, { params });
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching tenant payment stats:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch payment statistics",
        data: {}
      };
    }
  },

  /**
   * Get payments with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getPayments(params = {}) {
    try {
      const response = await api.get("/payments", { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.total || response.data.count || 0
      };
    } catch (error) {
      console.error("Error fetching payments:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch payments",
        data: []
      };
    }
  },

  /**
   * Get monthly payment summary
   * @param {number} year - Year (optional)
   * @param {number} month - Month (optional)
   * @returns {Promise<Object>} API response
   */
  async getMonthlyPaymentSummary(year = null, month = null) {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;

      const response = await api.get("/payments/monthly-summary", { params });
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching monthly payment summary:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch payment summary",
        data: {}
      };
    }
  },

  /**
   * Export tenants to CSV
   * @param {Object} filters - Export filters
   * @returns {Promise<Object>} API response
   */
  async exportTenants(filters = {}) {
    try {
      const response = await api.get("/tenants/export", {
        params: filters,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tenants-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Tenants exported successfully"
      };
    } catch (error) {
      console.error("Error exporting tenants:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to export tenants",
      };
    }
  },

  /**
   * Update unit
   * @param {string} unitId - Unit ID
   * @param {Object} unitData - Updated unit data
   * @returns {Promise<Object>} API response
   */
  async updateUnit(unitId, unitData) {
    try {
      const response = await api.put(`/units/${unitId}`, unitData);
      return {
        success: true,
        data: response.data.data,
        message: "Unit updated successfully",
      };
    } catch (error) {
      console.error("Error updating unit:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update unit",
      };
    }
  },

  /**
   * Delete unit
   * @param {string} unitId - Unit ID
   * @returns {Promise<Object>} API response
   */
  async deleteUnit(unitId) {
    try {
      const response = await api.delete(`/units/${unitId}`);
      return {
        success: true,
        message: "Unit deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting unit:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete unit",
      };
    }
  },

  // ==================== USER MANAGEMENT API ====================

  /**
   * Get all users with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} API response
   */
  async getAllUsers(page = 1, limit = 10) {
    try {
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data || {},
        pagination: response.data.data?.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch users',
        data: { users: [], pagination: {} }
      };
    }
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch user'
      };
    }
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} API response
   */
  async createUser(userData) {
    try {
      const formData = new FormData();

      // Append all user data to FormData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          if (key === 'image' && userData[key] instanceof File) {
            formData.append(key, userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        }
      });

      const response = await api.post('/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create user'
      };
    }
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} API response
   */
  async updateUser(userId, userData) {
    try {
      const formData = new FormData();

      // Append all user data to FormData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          if (key === 'image' && userData[key] instanceof File) {
            formData.append(key, userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        }
      });

      const response = await api.put(`/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update user'
      };
    }
  },

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return {
        success: true,
        message: response.data.message || 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete user'
      };
    }
  },

  /**
   * Get all roles for user creation/editing
   * @returns {Promise<Object>} API response
   */
  async getUserRoles() {
    try {
      const response = await api.get('/users/roles');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch user roles',
        data: []
      };
    }
  },

  /**
   * Get users by role ID (for building assignment)
   * @param {number} roleId - Role ID to filter users
   * @returns {Promise<Object>} API response
   */
  async getUsersByRole(roleId) {
    try {
      const response = await api.get(`/users?roleId=${roleId}&limit=100`);
      return {
        success: true,
        data: response.data.data?.users || []
      };
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch users by role',
        data: []
      };
    }
  },

  /**
   * Assign building to user
   * @param {number} buildingId - Building ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async assignBuildingToUser(buildingId, userId) {
    try {
      const response = await api.post('/buildings/assignBuildingToOwner', {
        buildingId,
        userId
      });
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Building assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning building to user:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to assign building to user'
      };
    }
  },

  /**
   * Assign villa to owner
   * @param {number} villaId - Villa ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async assignVillaToOwner(villaId, userId) {
    try {
      const response = await api.post('/villas/assignVillaToOwner', {
        villaId,
        userId
      });
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Villa assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning villa to owner:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to assign villa to owner'
      };
    }
  },

  /**
   * Remove villa from owner
   * @param {number} villaId - Villa ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async removeVillaFromOwner(villaId, userId) {
    try {
      const response = await api.delete('/villas/removeVillaFromOwner', {
        data: { villaId, userId }
      });
      return {
        success: true,
        message: response.data.message || 'Villa removed from owner successfully'
      };
    } catch (error) {
      console.error('Error removing villa from owner:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove villa from owner'
      };
    }
  },

  /**
   * Get villa assignments
   * @param {number} villaId - Villa ID
   * @returns {Promise<Object>} API response
   */
  async getVillaAssignments(villaId) {
    try {
      const response = await api.get(`/villas/getVillaAssignments/${villaId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching villa assignments:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch villa assignments',
        data: []
      };
    }
  },

  /**
   * Get user assigned villas
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async getUserAssignedVillas(userId) {
    try {
      const response = await api.get(`/villas/getUserAssignedVillas/${userId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching user assigned villas:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch user assigned villas',
        data: []
      };
    }
  },

  // ==================== PERMISSION MANAGEMENT ====================

  /**
   * Get all permissions
   * @returns {Promise<Object>} API response
   */
  async getAllPermissions() {
    try {
      const response = await api.get('/permissions/getAllPermissions');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch permissions',
        data: []
      };
    }
  },

  /**
   * Get permissions grouped by resource
   * @returns {Promise<Object>} API response
   */
  async getPermissionsGrouped() {
    try {
      const response = await api.get('/permissions/getPermissionsGrouped');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching grouped permissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch grouped permissions',
        data: []
      };
    }
  },

  /**
   * Get permissions by role
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} API response
   */
  async getPermissionsByRole(roleId) {
    try {
      const response = await api.get(`/permissions/getPermissionsByRole/${roleId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching permissions by role:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch permissions by role',
        data: []
      };
    }
  },

  /**
   * Get user permissions (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async getUserPermissions(userId) {
    try {
      const response = await api.get(`/permissions/getUserPermissions/${userId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch user permissions',
        data: []
      };
    }
  },

  /**
   * Get current user's permissions
   * @returns {Promise<Object>} API response
   */
  async getMyPermissions() {
    try {
      const response = await api.get('/permissions/getMyPermissions');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching my permissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch permissions',
        data: []
      };
    }
  },

  /**
   * Create new permission
   * @param {Object} permissionData - Permission data
   * @returns {Promise<Object>} API response
   */
  async createPermission(permissionData) {
    try {
      const response = await api.post('/permissions/createPermission', permissionData);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Permission created successfully'
      };
    } catch (error) {
      console.error('Error creating permission:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create permission'
      };
    }
  },

  /**
   * Update permission
   * @param {number} permissionId - Permission ID
   * @param {Object} permissionData - Permission data
   * @returns {Promise<Object>} API response
   */
  async updatePermission(permissionId, permissionData) {
    try {
      const response = await api.put(`/permissions/updatePermission/${permissionId}`, permissionData);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Permission updated successfully'
      };
    } catch (error) {
      console.error('Error updating permission:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update permission'
      };
    }
  },

  /**
   * Delete permission
   * @param {number} permissionId - Permission ID
   * @returns {Promise<Object>} API response
   */
  async deletePermission(permissionId) {
    try {
      const response = await api.delete(`/permissions/deletePermission/${permissionId}`);
      return {
        success: true,
        message: response.data.message || 'Permission deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting permission:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete permission'
      };
    }
  },

  /**
   * Assign permissions to role
   * @param {number} roleId - Role ID
   * @param {Array} permissionIds - Array of permission IDs
   * @returns {Promise<Object>} API response
   */
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      const response = await api.post(`/permissions/assignPermissionsToRole/${roleId}`, {
        permissionIds
      });
      return {
        success: true,
        message: response.data.message || 'Permissions assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning permissions to role:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to assign permissions to role'
      };
    }
  },

  /**
   * Get all roles with their permissions
   * @returns {Promise<Object>} API response
   */
  async getRolesWithPermissions() {
    try {
      const response = await api.get('/permissions/getRolesWithPermissions');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching roles with permissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch roles with permissions',
        data: []
      };
    }
  },

  /**
   * Get buildings assigned to a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} API response
   */
  async getUserAssignedBuildings(userId) {
    try {
      const response = await api.get(`/buildings/getUserAssignedBuildings/${userId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching user assigned buildings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch assigned buildings',
        data: []
      };
    }
  },
};

export default adminApiService;
