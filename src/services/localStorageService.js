/**
 * Local Storage Service
 * Provides persistent data storage for the property management platform
 */

class LocalStorageService {
  constructor() {
    this.storageKeys = {
      properties: 'pm_properties',
      tenants: 'pm_tenants',
      owners: 'pm_owners',
      leases: 'pm_leases',
      payments: 'pm_payments',
      maintenance: 'pm_maintenance',
      messages: 'pm_messages',
      documents: 'pm_documents',
      applications: 'pm_applications',
      users: 'pm_users',
      settings: 'pm_settings'
    };
    
    this.initializeData();
  }

  /**
   * Initialize data if not exists
   */
  initializeData() {
    if (!this.getData('settings')?.initialized) {
      this.seedInitialData();
      this.setData('settings', { initialized: true, version: '1.0.0' });
    }
  }

  /**
   * Get data from localStorage
   */
  getData(key) {
    try {
      const data = localStorage.getItem(this.storageKeys[key]);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data to localStorage
   */
  setData(key, data) {
    try {
      localStorage.setItem(this.storageKeys[key], JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Add item to array in localStorage
   */
  addItem(key, item) {
    const data = this.getData(key) || [];
    const newItem = {
      ...item,
      id: item.id || this.generateId(),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.push(newItem);
    this.setData(key, data);
    return newItem;
  }

  /**
   * Update item in array
   */
  updateItem(key, id, updates) {
    const data = this.getData(key) || [];
    const index = data.findIndex(item => item.id === id);
    
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.setData(key, data);
      return data[index];
    }
    return null;
  }

  /**
   * Delete item from array
   */
  deleteItem(key, id) {
    const data = this.getData(key) || [];
    const filteredData = data.filter(item => item.id !== id);
    this.setData(key, filteredData);
    return true;
  }

  /**
   * Find item by ID
   */
  findById(key, id) {
    const data = this.getData(key) || [];
    return data.find(item => item.id === id);
  }

  /**
   * Find items by criteria
   */
  findBy(key, criteria) {
    const data = this.getData(key) || [];
    return data.filter(item => {
      return Object.keys(criteria).every(field => {
        if (typeof criteria[field] === 'object' && criteria[field].$in) {
          return criteria[field].$in.includes(item[field]);
        }
        return item[field] === criteria[field];
      });
    });
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clear all data (for demo reset)
   */
  clearAllData() {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeData();
  }

  /**
   * Seed initial demo data
   */
  seedInitialData() {
    // Users
    const users = [
      {
        id: 1,
        username: "admin",
        email: "admin@gmail.com",
        password: "admin123",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        phone_number: "+971 50 123 4567",
        status: "active"
      },
      {
        id: 2,
        username: "owner",
        email: "owner@gmail.com",
        password: "owner123",
        first_name: "Ahmed",
        last_name: "Al-Rashid",
        role: "owner",
        phone_number: "+971 55 987 6543",
        company_name: "Al-Rashid Properties",
        license_number: "CR-2023-001234",
        status: "active"
      },
      {
        id: 3,
        username: "tenant",
        email: "tenant@gmail.com",
        password: "tenant123",
        first_name: "Sarah",
        last_name: "Johnson",
        role: "tenant",
        phone_number: "+971 56 789 0123",
        nationality: "American",
        emirates_id: "784-1990-1234567-8",
        status: "active"
      }
    ];

    // Properties
    const properties = [
      {
        id: 1,
        owner_id: 2,
        name: "Al-Noor Residential Complex",
        type: "apartment",
        address: "Al-Noor Street, Business Bay, Dubai",
        city: "Dubai",
        emirate: "Dubai",
        postal_code: "00000",
        bedrooms: 2,
        bathrooms: 2,
        area_sqft: 1200,
        floor: 2,
        unit_number: "A-205",
        monthly_rent: 2400,
        security_deposit: 4800,
        commission: 240,
        status: "occupied",
        furnished: "semi-furnished",
        parking_spaces: 1,
        balcony: true,
        amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Elevator"],
        description: "Beautiful 2-bedroom apartment in the heart of Business Bay with stunning city views.",
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
        ],
        available_from: "2023-06-15T00:00:00Z"
      },
      {
        id: 2,
        owner_id: 2,
        name: "Marina Heights Tower",
        type: "apartment",
        address: "Marina Walk, Dubai Marina, Dubai",
        city: "Dubai",
        emirate: "Dubai",
        postal_code: "00000",
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 800,
        floor: 15,
        unit_number: "1502",
        monthly_rent: 3200,
        security_deposit: 6400,
        commission: 320,
        status: "available",
        furnished: "fully-furnished",
        parking_spaces: 1,
        balcony: true,
        amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Concierge"],
        description: "Luxury 1-bedroom apartment with marina views and premium amenities.",
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
        ],
        available_from: "2024-03-01T00:00:00Z"
      }
    ];

    // Leases
    const leases = [
      {
        id: 1,
        property_id: 1,
        tenant_id: 3,
        owner_id: 2,
        lease_start: "2023-06-15T00:00:00Z",
        lease_end: "2024-06-14T23:59:59Z",
        monthly_rent: 2400,
        security_deposit: 4800,
        commission: 240,
        status: "active",
        contract_type: "annual",
        auto_renewal: true,
        notice_period_days: 60,
        ejari_number: "EJ-2023-789456",
        ejari_expiry: "2024-06-14T23:59:59Z",
        signed_date: "2023-06-10T00:00:00Z"
      }
    ];

    // Payments
    const payments = [
      {
        id: 1,
        lease_id: 1,
        tenant_id: 3,
        amount: 2400,
        payment_date: "2024-02-01T10:30:00Z",
        due_date: "2024-02-01T23:59:59Z",
        payment_type: "rent",
        status: "paid",
        method: "bank_transfer",
        reference_number: "TXN-240201-001",
        description: "Monthly rent - February 2024"
      },
      {
        id: 2,
        lease_id: 1,
        tenant_id: 3,
        amount: 2400,
        payment_date: null,
        due_date: "2024-03-01T23:59:59Z",
        payment_type: "rent",
        status: "pending",
        method: null,
        reference_number: null,
        description: "Monthly rent - March 2024"
      }
    ];

    // Maintenance Requests
    const maintenance = [
      {
        id: 1,
        property_id: 1,
        tenant_id: 3,
        title: "Kitchen sink leakage",
        description: "The kitchen sink has been leaking for the past two days.",
        priority: "medium",
        status: "in_progress",
        category: "plumbing",
        submitted_date: "2024-02-10T14:30:00Z",
        assigned_vendor: "Dubai Plumbing Services",
        estimated_cost: 150
      }
    ];

    // Set all data
    this.setData('users', users);
    this.setData('properties', properties);
    this.setData('leases', leases);
    this.setData('payments', payments);
    this.setData('maintenance', maintenance);
    this.setData('messages', []);
    this.setData('documents', []);
    this.setData('applications', []);
  }
}

// Create and export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;
