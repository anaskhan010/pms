/**
 * Application Service
 * Handles tenant applications and approval workflow
 */

import { localStorageService } from './localStorageService';

// Mock delay to simulate API calls
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class ApplicationService {
  /**
   * Submit property application
   */
  async submitApplication(applicationData) {
    await mockDelay();
    
    try {
      const application = {
        ...applicationData,
        status: 'pending',
        submitted_date: new Date().toISOString(),
        application_number: this.generateApplicationNumber()
      };
      
      const savedApplication = localStorageService.addItem('applications', application);
      
      return {
        success: true,
        data: savedApplication,
        message: 'Application submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to submit application'
      };
    }
  }

  /**
   * Get applications
   */
  async getApplications(filters = {}) {
    await mockDelay();
    
    let applications = localStorageService.getData('applications') || [];
    
    // Apply filters
    if (filters.property_id) {
      applications = applications.filter(a => a.property_id === filters.property_id);
    }
    
    if (filters.tenant_id) {
      applications = applications.filter(a => a.tenant_id === filters.tenant_id);
    }
    
    if (filters.status) {
      applications = applications.filter(a => a.status === filters.status);
    }
    
    // Enrich with related data
    const enrichedApplications = applications.map(application => {
      const property = localStorageService.findById('properties', application.property_id);
      const tenant = localStorageService.findById('users', application.tenant_id);
      const owner = property ? localStorageService.findById('users', property.owner_id) : null;
      
      return {
        ...application,
        property: property ? {
          id: property.id,
          name: property.name,
          address: property.address,
          unit_number: property.unit_number,
          monthly_rent: property.monthly_rent,
          type: property.type
        } : null,
        tenant: tenant ? {
          id: tenant.id,
          name: `${tenant.first_name} ${tenant.last_name}`,
          email: tenant.email,
          phone: tenant.phone_number,
          emirates_id: tenant.emirates_id
        } : null,
        owner: owner ? {
          id: owner.id,
          name: `${owner.first_name} ${owner.last_name}`,
          email: owner.email
        } : null
      };
    });
    
    return {
      success: true,
      data: enrichedApplications
    };
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id) {
    await mockDelay();
    
    const application = localStorageService.findById('applications', id);
    
    if (!application) {
      return {
        success: false,
        error: 'Application not found'
      };
    }
    
    // Enrich with related data
    const property = localStorageService.findById('properties', application.property_id);
    const tenant = localStorageService.findById('users', application.tenant_id);
    const owner = property ? localStorageService.findById('users', property.owner_id) : null;
    
    const enrichedApplication = {
      ...application,
      property: property,
      tenant: tenant,
      owner: owner
    };
    
    return {
      success: true,
      data: enrichedApplication
    };
  }

  /**
   * Approve application and create lease
   */
  async approveApplication(applicationId, leaseData = {}) {
    await mockDelay();
    
    try {
      const application = localStorageService.findById('applications', applicationId);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }
      
      if (application.status !== 'pending') {
        return {
          success: false,
          error: 'Application is not in pending status'
        };
      }
      
      // Update application status
      const updatedApplication = localStorageService.updateItem('applications', applicationId, {
        status: 'approved',
        approved_date: new Date().toISOString(),
        approved_by: leaseData.approved_by || 'admin'
      });
      
      // Create lease
      const lease = {
        property_id: application.property_id,
        tenant_id: application.tenant_id,
        owner_id: application.owner_id,
        lease_start: leaseData.lease_start || new Date().toISOString(),
        lease_end: leaseData.lease_end || this.calculateLeaseEnd(leaseData.lease_start),
        monthly_rent: leaseData.monthly_rent || application.proposed_rent,
        security_deposit: leaseData.security_deposit || (application.proposed_rent * 2),
        commission: leaseData.commission || (application.proposed_rent * 0.1),
        status: 'active',
        contract_type: leaseData.contract_type || 'annual',
        auto_renewal: leaseData.auto_renewal || false,
        notice_period_days: leaseData.notice_period_days || 60,
        ejari_number: this.generateEjariNumber(),
        ejari_expiry: leaseData.lease_end || this.calculateLeaseEnd(leaseData.lease_start),
        signed_date: new Date().toISOString()
      };
      
      const savedLease = localStorageService.addItem('leases', lease);
      
      // Update property status
      localStorageService.updateItem('properties', application.property_id, {
        status: 'occupied'
      });
      
      return {
        success: true,
        data: {
          application: updatedApplication,
          lease: savedLease
        },
        message: 'Application approved and lease created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to approve application'
      };
    }
  }

  /**
   * Reject application
   */
  async rejectApplication(applicationId, reason = '') {
    await mockDelay();
    
    try {
      const application = localStorageService.findById('applications', applicationId);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }
      
      if (application.status !== 'pending') {
        return {
          success: false,
          error: 'Application is not in pending status'
        };
      }
      
      const updatedApplication = localStorageService.updateItem('applications', applicationId, {
        status: 'rejected',
        rejected_date: new Date().toISOString(),
        rejection_reason: reason
      });
      
      return {
        success: true,
        data: updatedApplication,
        message: 'Application rejected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reject application'
      };
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(ownerId = null) {
    await mockDelay();
    
    let applications = localStorageService.getData('applications') || [];
    
    if (ownerId) {
      // Filter by owner's properties
      const ownerProperties = localStorageService.findBy('properties', { owner_id: ownerId });
      const propertyIds = ownerProperties.map(p => p.id);
      applications = applications.filter(a => propertyIds.includes(a.property_id));
    }
    
    const stats = {
      total_applications: applications.length,
      pending_applications: applications.filter(a => a.status === 'pending').length,
      approved_applications: applications.filter(a => a.status === 'approved').length,
      rejected_applications: applications.filter(a => a.status === 'rejected').length,
      approval_rate: applications.length > 0 
        ? Math.round((applications.filter(a => a.status === 'approved').length / applications.length) * 100)
        : 0
    };
    
    return {
      success: true,
      data: stats
    };
  }

  /**
   * Generate application number
   */
  generateApplicationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `APP-${year}${month}${day}-${random}`;
  }

  /**
   * Generate Ejari number
   */
  generateEjariNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return `EJ-${year}-${random}`;
  }

  /**
   * Calculate lease end date (default 1 year)
   */
  calculateLeaseEnd(startDate, months = 12) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    end.setDate(end.getDate() - 1); // End day before anniversary
    end.setHours(23, 59, 59, 999);
    
    return end.toISOString();
  }
}

// Create and export singleton instance
export const applicationService = new ApplicationService();
export default applicationService;
