/**
 * Property Service
 * Handles all property-related operations with localStorage persistence
 */

import { localStorageService } from './localStorageService';

// Mock delay to simulate API calls
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class PropertyService {
  /**
   * Get all properties
   */
  async getProperties(filters = {}) {
    await mockDelay();
    
    let properties = localStorageService.getData('properties') || [];
    
    // Apply filters
    if (filters.owner_id) {
      properties = properties.filter(p => p.owner_id === filters.owner_id);
    }
    
    if (filters.status) {
      properties = properties.filter(p => p.status === filters.status);
    }
    
    if (filters.type) {
      properties = properties.filter(p => p.type === filters.type);
    }
    
    if (filters.city) {
      properties = properties.filter(p => 
        p.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    // Add related data
    const enrichedProperties = properties.map(property => {
      const owner = localStorageService.findById('users', property.owner_id);
      const lease = localStorageService.findBy('leases', { property_id: property.id })[0];
      const tenant = lease ? localStorageService.findById('users', lease.tenant_id) : null;
      
      return {
        ...property,
        owner: owner ? {
          id: owner.id,
          name: `${owner.first_name} ${owner.last_name}`,
          email: owner.email,
          phone: owner.phone_number
        } : null,
        current_lease: lease,
        current_tenant: tenant ? {
          id: tenant.id,
          name: `${tenant.first_name} ${tenant.last_name}`,
          email: tenant.email,
          phone: tenant.phone_number
        } : null
      };
    });
    
    return {
      success: true,
      data: enrichedProperties
    };
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id) {
    await mockDelay();
    
    const property = localStorageService.findById('properties', id);
    
    if (!property) {
      return {
        success: false,
        error: 'Property not found'
      };
    }
    
    // Add related data
    const owner = localStorageService.findById('users', property.owner_id);
    const lease = localStorageService.findBy('leases', { property_id: property.id })[0];
    const tenant = lease ? localStorageService.findById('users', lease.tenant_id) : null;
    const maintenanceRequests = localStorageService.findBy('maintenance', { property_id: property.id });
    const payments = lease ? localStorageService.findBy('payments', { lease_id: lease.id }) : [];
    
    const enrichedProperty = {
      ...property,
      owner: owner ? {
        id: owner.id,
        name: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        phone: owner.phone_number,
        company: owner.company_name
      } : null,
      current_lease: lease,
      current_tenant: tenant ? {
        id: tenant.id,
        name: `${tenant.first_name} ${tenant.last_name}`,
        email: tenant.email,
        phone: tenant.phone_number,
        emirates_id: tenant.emirates_id
      } : null,
      maintenance_requests: maintenanceRequests,
      payment_history: payments
    };
    
    return {
      success: true,
      data: enrichedProperty
    };
  }

  /**
   * Create new property
   */
  async createProperty(propertyData) {
    await mockDelay();
    
    try {
      const newProperty = {
        ...propertyData,
        status: propertyData.status || 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const savedProperty = localStorageService.addItem('properties', newProperty);
      
      return {
        success: true,
        data: savedProperty,
        message: 'Property created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create property'
      };
    }
  }

  /**
   * Update property
   */
  async updateProperty(id, updates) {
    await mockDelay();
    
    try {
      const updatedProperty = localStorageService.updateItem('properties', id, updates);
      
      if (!updatedProperty) {
        return {
          success: false,
          error: 'Property not found'
        };
      }
      
      return {
        success: true,
        data: updatedProperty,
        message: 'Property updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update property'
      };
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id) {
    await mockDelay();
    
    try {
      // Check if property has active lease
      const activeLease = localStorageService.findBy('leases', { 
        property_id: id, 
        status: 'active' 
      })[0];
      
      if (activeLease) {
        return {
          success: false,
          error: 'Cannot delete property with active lease'
        };
      }
      
      localStorageService.deleteItem('properties', id);
      
      return {
        success: true,
        message: 'Property deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete property'
      };
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(ownerId = null) {
    await mockDelay();
    
    let properties = localStorageService.getData('properties') || [];
    
    if (ownerId) {
      properties = properties.filter(p => p.owner_id === ownerId);
    }
    
    const leases = localStorageService.getData('leases') || [];
    const payments = localStorageService.getData('payments') || [];
    
    const stats = {
      total_properties: properties.length,
      occupied_properties: properties.filter(p => p.status === 'occupied').length,
      available_properties: properties.filter(p => p.status === 'available').length,
      maintenance_properties: properties.filter(p => p.status === 'maintenance').length,
      total_units: properties.length,
      occupancy_rate: properties.length > 0 
        ? Math.round((properties.filter(p => p.status === 'occupied').length / properties.length) * 100)
        : 0,
      total_rent_collected: payments
        .filter(p => p.status === 'paid' && p.payment_type === 'rent')
        .reduce((sum, p) => sum + p.amount, 0),
      pending_rent: payments
        .filter(p => p.status === 'pending' && p.payment_type === 'rent')
        .reduce((sum, p) => sum + p.amount, 0),
      active_leases: leases.filter(l => l.status === 'active').length,
      expiring_leases: leases.filter(l => {
        const expiryDate = new Date(l.lease_end);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiryDate <= threeMonthsFromNow && l.status === 'active';
      }).length
    };
    
    return {
      success: true,
      data: stats
    };
  }

  /**
   * Search properties
   */
  async searchProperties(query, filters = {}) {
    await mockDelay();
    
    let properties = localStorageService.getData('properties') || [];
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      properties = properties.filter(property => 
        property.name.toLowerCase().includes(searchTerm) ||
        property.address.toLowerCase().includes(searchTerm) ||
        property.city.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm) ||
        property.unit_number.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        properties = properties.filter(property => {
          if (key === 'min_rent') {
            return property.monthly_rent >= filters[key];
          }
          if (key === 'max_rent') {
            return property.monthly_rent <= filters[key];
          }
          if (key === 'min_bedrooms') {
            return property.bedrooms >= filters[key];
          }
          return property[key] === filters[key];
        });
      }
    });
    
    return {
      success: true,
      data: properties
    };
  }

  /**
   * Get available properties for rent
   */
  async getAvailableProperties() {
    await mockDelay();
    
    const properties = localStorageService.getData('properties') || [];
    const availableProperties = properties.filter(p => p.status === 'available');
    
    return {
      success: true,
      data: availableProperties
    };
  }
}

// Create and export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
