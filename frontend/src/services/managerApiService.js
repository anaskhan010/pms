import api from "./api";

/**
 * Manager API Service
 * Comprehensive service for all manager operations with exact backend API mapping
 */
export const managerApiService = {
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
        data: response.data.data?.result || response.data.data || [],
        total: response.data.count || response.data.data?.result?.length || 0,
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
   * Get unit details with related data
   * @param {string} unitId - Unit ID
   * @returns {Promise<Object>} API response
   */
  async getUnitDetails(unitId) {
    try {
      const response = await api.get(`/units/${unitId}/details`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching unit details:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch unit details",
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
   * Update unit status
   * @param {string} unitId - Unit ID
   * @param {string} status - New status
   * @returns {Promise<Object>} API response
   */
  async updateUnitStatus(unitId, status) {
    try {
      const response = await api.put(`/units/${unitId}/status`, {
        current_status: status,
      });
      return {
        success: true,
        data: response.data.data,
        message: "Unit status updated successfully",
      };
    } catch (error) {
      console.error("Error updating unit status:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update unit status",
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
      await api.delete(`/units/${unitId}`);
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

  // ==================== TENANTS API ====================

  /**
   * Get all tenants with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getTenants(params = {}) {
    try {
      const response = await api.get("/tenants/get-all-tenants", { params });
      return {
        success: true,
        data: response.data.data?.result || response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.count || response.data.data?.result?.length || 0,
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
   * Create new tenant
   * @param {Object} tenantData - Tenant data
   * @returns {Promise<Object>} API response
   */
  async createTenant(tenantData) {
    try {
      const response = await api.post("/tenants/create-tenant", tenantData);
      return {
        success: true,
        data: response.data.data,
        message: "Tenant created successfully",
      };
    } catch (error) {
      console.error("Error creating tenant:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create tenant",
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
   * Delete tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} API response
   */
  async deleteTenant(tenantId) {
    try {
      await api.delete(`/tenants/${tenantId}`);
      return {
        success: true,
        message: "Tenant deleted successfully",
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
      };
    } catch (error) {
      console.error("Error fetching tenant contracts:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch tenant contracts",
        data: [],
      };
    }
  },

  /**
   * Get tenant active contracts
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} API response
   */
  async getTenantActiveContracts(tenantId) {
    try {
      const response = await api.get(`/tenants/${tenantId}/active-contracts`);
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error("Error fetching tenant active contracts:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch tenant active contracts",
        data: [],
      };
    }
  },

  // ==================== OWNERS API ====================

  /**
   * Get all owners
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getOwners(params = {}) {
    try {
      const response = await api.get("/owners/find-all-owners", { params });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching owners:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch owners",
        data: [],
      };
    }
  },

  /**
   * Get single owner by ID
   * @param {string} ownerId - Owner ID
   * @returns {Promise<Object>} API response
   */
  async getOwner(ownerId) {
    try {
      const response = await api.get(`/owners/${ownerId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching owner:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch owner",
      };
    }
  },

  /**
   * Create new owner
   * @param {Object} ownerData - Owner data
   * @returns {Promise<Object>} API response
   */
  async createOwner(ownerData) {
    try {
      const response = await api.post("/owners/create-owner", ownerData);
      return {
        success: true,
        data: response.data.data,
        message: "Owner created successfully",
      };
    } catch (error) {
      console.error("Error creating owner:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create owner",
      };
    }
  },

  /**
   * Update owner
   * @param {string} ownerId - Owner ID
   * @param {Object} ownerData - Updated owner data
   * @returns {Promise<Object>} API response
   */
  async updateOwner(ownerId, ownerData) {
    try {
      const response = await api.put(`/owners/${ownerId}`, ownerData);
      return {
        success: true,
        data: response.data.data,
        message: "Owner updated successfully",
      };
    } catch (error) {
      console.error("Error updating owner:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update owner",
      };
    }
  },

  /**
   * Delete owner
   * @param {string} ownerId - Owner ID
   * @returns {Promise<Object>} API response
   */
  async deleteOwner(ownerId) {
    try {
      await api.delete(`/owners/${ownerId}`);
      return {
        success: true,
        message: "Owner deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting owner:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete owner",
      };
    }
  },

  /**
   * Get owner properties
   * @param {string} ownerId - Owner ID
   * @returns {Promise<Object>} API response
   */
  async getOwnerProperties(ownerId) {
    try {
      const response = await api.get(`/owners/${ownerId}/properties`);
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error("Error fetching owner properties:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch owner properties",
        data: [],
      };
    }
  },

  /**
   * Get owner financial summary
   * @param {string} ownerId - Owner ID
   * @returns {Promise<Object>} API response
   */
  async getOwnerFinancialSummary(ownerId) {
    try {
      const response = await api.get(`/owners/${ownerId}/financial-summary`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching owner financial summary:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch owner financial summary",
      };
    }
  },

  // ==================== CONTRACTS API ====================

  /**
   * Get all contracts with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getContracts(params = {}) {
    try {
      const response = await api.get("/contracts", { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching contracts:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch contracts",
        data: [],
      };
    }
  },

  /**
   * Get single contract by ID
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} API response
   */
  async getContract(contractId) {
    try {
      const response = await api.get(`/contracts/${contractId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching contract:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch contract",
      };
    }
  },

  /**
   * Get contract details with related data
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} API response
   */
  async getContractDetails(contractId) {
    try {
      const response = await api.get(`/contracts/${contractId}/details`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching contract details:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch contract details",
      };
    }
  },

  /**
   * Create new contract
   * @param {Object} contractData - Contract data
   * @returns {Promise<Object>} API response
   */
  async createContract(contractData) {
    try {
      const response = await api.post(
        "/contracts/create-contract",
        contractData
      );
      return {
        success: true,
        data: response.data.data,
        message: "Contract created successfully",
      };
    } catch (error) {
      console.error("Error creating contract:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create contract",
      };
    }
  },

  /**
   * Update contract
   * @param {string} contractId - Contract ID
   * @param {Object} contractData - Updated contract data
   * @returns {Promise<Object>} API response
   */
  async updateContract(contractId, contractData) {
    try {
      const response = await api.put(`/contracts/${contractId}`, contractData);
      return {
        success: true,
        data: response.data.data,
        message: "Contract updated successfully",
      };
    } catch (error) {
      console.error("Error updating contract:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update contract",
      };
    }
  },

  /**
   * Update contract status
   * @param {string} contractId - Contract ID
   * @param {string} status - New status
   * @returns {Promise<Object>} API response
   */
  async updateContractStatus(contractId, status) {
    try {
      const response = await api.put(`/contracts/${contractId}/status`, {
        contract_status: status,
      });
      return {
        success: true,
        data: response.data.data,
        message: "Contract status updated successfully",
      };
    } catch (error) {
      console.error("Error updating contract status:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update contract status",
      };
    }
  },

  /**
   * Renew contract
   * @param {string} contractId - Contract ID
   * @param {Object} renewalData - Renewal data
   * @returns {Promise<Object>} API response
   */
  async renewContract(contractId, renewalData) {
    try {
      const response = await api.post(
        `/contracts/${contractId}/renew`,
        renewalData
      );
      return {
        success: true,
        data: response.data.data,
        message: "Contract renewed successfully",
      };
    } catch (error) {
      console.error("Error renewing contract:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to renew contract",
      };
    }
  },

  /**
   * Delete contract
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} API response
   */
  async deleteContract(contractId) {
    try {
      await api.delete(`/contracts/${contractId}`);
      return {
        success: true,
        message: "Contract deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting contract:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete contract",
      };
    }
  },

  // ==================== DASHBOARD STATISTICS ====================

  /**
   * Get dashboard statistics for manager
   * @returns {Promise<Object>} API response
   */
  async getDashboardStats() {
    try {
      // Since there's no specific dashboard endpoint, we'll aggregate data from multiple endpoints
      const [propertiesRes, unitsRes, tenantsRes, contractsRes] =
        await Promise.allSettled([
          this.getProperties({ limit: 1 }),
          this.getUnits({ limit: 1 }),
          this.getTenants({ limit: 1 }),
          this.getContracts({ limit: 1 }),
        ]);

      const stats = {
        totalProperties:
          propertiesRes.status === "fulfilled" ? propertiesRes.value.total : 0,
        totalUnits: unitsRes.status === "fulfilled" ? unitsRes.value.total : 0,
        totalTenants:
          tenantsRes.status === "fulfilled" ? tenantsRes.value.total : 0,
        totalContracts:
          contractsRes.status === "fulfilled" ? contractsRes.value.total : 0,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error: "Failed to fetch dashboard statistics",
        data: {
          totalProperties: 0,
          totalUnits: 0,
          totalTenants: 0,
          totalContracts: 0,
        },
      };
    }
  },
};

export default managerApiService;
