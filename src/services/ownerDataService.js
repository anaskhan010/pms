/**
 * Mock data service for owner-related data
 * This service provides mock data for property owners including their properties,
 * tenants, financial information, and maintenance requests.
 */

// Mock property images
const propertyImages = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
];

// Mock owner properties data
const mockProperties = [
  {
    id: 1,
    name: "Al-Noor Residential Complex",
    type: "building",
    address: "King Fahd Road, Riyadh",
    total_units: 24,
    occupied_units: 20,
    vacant_units: 4,
    monthly_income: 48000,
    property_value: 2400000,
    image: propertyImages[0],
    status: "active",
    construction_year: 2019,
    amenities: ["Parking", "Security", "Elevator", "Garden"],
    condition: "excellent",
    last_maintenance: "2024-01-15"
  },
  {
    id: 2,
    name: "Sunset Villa",
    type: "villa",
    address: "Al-Malqa District, Riyadh",
    total_units: 1,
    occupied_units: 1,
    vacant_units: 0,
    monthly_income: 8500,
    property_value: 850000,
    image: propertyImages[1],
    status: "active",
    construction_year: 2020,
    amenities: ["Private Pool", "Garden", "Garage", "Maid Room"],
    condition: "excellent",
    last_maintenance: "2024-02-01"
  },
  {
    id: 3,
    name: "Golden Plaza Shops",
    type: "commercial",
    address: "Olaya Street, Riyadh",
    total_units: 8,
    occupied_units: 6,
    vacant_units: 2,
    monthly_income: 32000,
    property_value: 1600000,
    image: propertyImages[2],
    status: "active",
    construction_year: 2018,
    amenities: ["Central AC", "Parking", "Security", "Loading Dock"],
    condition: "good",
    last_maintenance: "2024-01-20"
  },
  {
    id: 4,
    name: "Green Gardens Apartments",
    type: "building",
    address: "Al-Wurud District, Riyadh",
    total_units: 16,
    occupied_units: 14,
    vacant_units: 2,
    monthly_income: 28000,
    property_value: 1400000,
    image: propertyImages[3],
    status: "active",
    construction_year: 2021,
    amenities: ["Swimming Pool", "Gym", "Playground", "Security"],
    condition: "excellent",
    last_maintenance: "2024-02-10"
  },
  {
    id: 5,
    name: "Heritage Villa",
    type: "villa",
    address: "Diplomatic Quarter, Riyadh",
    total_units: 1,
    occupied_units: 0,
    vacant_units: 1,
    monthly_income: 0,
    property_value: 1200000,
    image: propertyImages[4],
    status: "maintenance",
    construction_year: 2017,
    amenities: ["Private Pool", "Garden", "Garage", "Guest House"],
    condition: "under_renovation",
    last_maintenance: "2024-02-15"
  }
];

// Mock tenants data
const mockTenants = [
  {
    id: 1,
    name: "Mohammed Al-Ahmed",
    email: "mohammed.ahmed@email.com",
    phone: "+966 50 123 4567",
    property_id: 1,
    property_name: "Al-Noor Residential Complex",
    unit_number: "A-101",
    lease_start: "2023-06-01",
    lease_end: "2024-06-01",
    monthly_rent: 2400,
    deposit: 7200,
    payment_status: "current",
    last_payment: "2024-02-01",
    next_payment: "2024-03-01"
  },
  {
    id: 2,
    name: "Sarah Al-Mansouri",
    email: "sarah.mansouri@email.com",
    phone: "+966 55 987 6543",
    property_id: 2,
    property_name: "Sunset Villa",
    unit_number: "Villa",
    lease_start: "2023-09-01",
    lease_end: "2024-09-01",
    monthly_rent: 8500,
    deposit: 25500,
    payment_status: "current",
    last_payment: "2024-02-01",
    next_payment: "2024-03-01"
  },
  {
    id: 3,
    name: "Abdullah Trading Co.",
    email: "info@abdullahtrading.com",
    phone: "+966 11 456 7890",
    property_id: 3,
    property_name: "Golden Plaza Shops",
    unit_number: "Shop-05",
    lease_start: "2023-01-01",
    lease_end: "2025-01-01",
    monthly_rent: 5500,
    deposit: 16500,
    payment_status: "overdue",
    last_payment: "2024-01-01",
    next_payment: "2024-02-01"
  }
];

// Mock financial data
const mockFinancialData = {
  total_portfolio_value: 8450000,
  monthly_income: 116500,
  yearly_income: 1398000,
  outstanding_payments: 5500,
  occupancy_rate: 87.8,
  properties_count: 5,
  total_units: 50,
  occupied_units: 41,
  vacant_units: 9
};

// Mock maintenance requests
const mockMaintenanceRequests = [
  {
    id: 1,
    property_id: 1,
    property_name: "Al-Noor Residential Complex",
    unit_number: "A-205",
    tenant_name: "Ahmed Al-Rashid",
    issue: "Air conditioning not working",
    priority: "high",
    status: "in_progress",
    created_date: "2024-02-18",
    assigned_to: "AC Repair Services",
    estimated_cost: 450
  },
  {
    id: 2,
    property_id: 4,
    property_name: "Green Gardens Apartments",
    unit_number: "B-102",
    tenant_name: "Fatima Al-Zahra",
    issue: "Kitchen sink leaking",
    priority: "medium",
    status: "pending",
    created_date: "2024-02-19",
    assigned_to: null,
    estimated_cost: 200
  }
];

// Mock complaints data
const mockComplaints = [
  {
    id: 1,
    property_id: 1,
    property_name: "Al-Noor Residential Complex",
    tenant_name: "Mohammed Al-Ahmed",
    subject: "Noise complaint from neighboring unit",
    description: "Loud music during late hours from unit A-102",
    priority: "medium",
    status: "resolved",
    created_date: "2024-02-10",
    resolved_date: "2024-02-15"
  },
  {
    id: 2,
    property_id: 3,
    property_name: "Golden Plaza Shops",
    tenant_name: "Abdullah Trading Co.",
    subject: "Parking space issue",
    description: "Assigned parking space is being used by others",
    priority: "low",
    status: "open",
    created_date: "2024-02-17",
    resolved_date: null
  }
];

/**
 * Owner Data Service
 * Provides mock data and API simulation for owner dashboard
 */
export const ownerDataService = {
  // Get owner's properties
  async getOwnerProperties(ownerId = 2) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: mockProperties,
      total: mockProperties.length
    };
  },

  // Get owner's tenants
  async getOwnerTenants(ownerId = 2) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      data: mockTenants,
      total: mockTenants.length
    };
  },

  // Get financial overview
  async getFinancialOverview(ownerId = 2) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: mockFinancialData
    };
  },

  // Get maintenance requests
  async getMaintenanceRequests(ownerId = 2) {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      success: true,
      data: mockMaintenanceRequests,
      total: mockMaintenanceRequests.length
    };
  },

  // Get complaints
  async getComplaints(ownerId = 2) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: mockComplaints,
      total: mockComplaints.length
    };
  },

  // Get property details
  async getPropertyDetails(propertyId) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const property = mockProperties.find(p => p.id === parseInt(propertyId));
    return {
      success: true,
      data: property || null
    };
  }
};

export default ownerDataService;
