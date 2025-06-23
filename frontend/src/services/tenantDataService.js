/**
 * Tenant Data Service
 * Provides mock data and API simulation for tenant-specific features
 */

// Mock delay to simulate API calls
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock tenant properties data
const mockTenantProperties = [
  {
    id: 1,
    tenant_id: 3,
    property_name: "Al-Noor Residential Complex",
    unit_number: "A-205",
    address: "Al-Noor Street, Business Bay, Dubai",
    property_type: "apartment",
    floor: 2,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1200,
    lease_start: "2023-06-15T00:00:00Z",
    lease_end: "2024-06-14T23:59:59Z",
    monthly_rent: 2400,
    deposit_amount: 4800,
    ejari_number: "EJ-2023-789456",
    ejari_expiry: "2024-06-14T23:59:59Z",
    ejari_status: "active",
    property_condition: "excellent",
    parking_space: "P-205",
    balcony: true,
    furnished: "semi-furnished",
    amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Elevator"],
    landlord_name: "Ahmed Al-Rashid",
    landlord_phone: "+966 55 987 6543",
    property_manager: "Al-Rashid Properties",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
  }
];

// Mock lease agreements
const mockLeaseAgreements = [
  {
    id: 1,
    tenant_id: 3,
    property_id: 1,
    lease_start: "2023-06-15T00:00:00Z",
    lease_end: "2024-06-14T23:59:59Z",
    monthly_rent: 2400,
    deposit_amount: 4800,
    security_deposit: 4800,
    commission: 240,
    contract_type: "annual",
    auto_renewal: true,
    notice_period_days: 60,
    rent_increase_percentage: 5,
    payment_due_date: 1, // 1st of each month
    late_fee_percentage: 2,
    terms_and_conditions: [
      "Tenant is responsible for utility bills",
      "No pets allowed without prior approval",
      "Smoking is prohibited inside the unit",
      "Subletting requires landlord approval",
      "Property must be maintained in good condition"
    ],
    renewal_options: {
      available: true,
      early_renewal_discount: 2,
      renewal_deadline: "2024-04-14T23:59:59Z"
    },
    status: "active",
    signed_date: "2023-06-10T00:00:00Z",
    contract_file: "lease_agreement_2023.pdf"
  }
];

// Mock payment history
const mockPaymentHistory = [
  {
    id: 1,
    tenant_id: 3,
    amount: 2400,
    payment_date: "2024-02-01T10:30:00Z",
    due_date: "2024-02-01T23:59:59Z",
    payment_type: "rent",
    status: "paid",
    method: "bank_transfer",
    reference_number: "TXN-240201-001",
    description: "Monthly rent - February 2024",
    late_fee: 0
  },
  {
    id: 2,
    tenant_id: 3,
    amount: 2400,
    payment_date: "2024-01-01T09:15:00Z",
    due_date: "2024-01-01T23:59:59Z",
    payment_type: "rent",
    status: "paid",
    method: "bank_transfer",
    reference_number: "TXN-240101-001",
    description: "Monthly rent - January 2024",
    late_fee: 0
  },
  {
    id: 3,
    tenant_id: 3,
    amount: 2448,
    payment_date: "2023-12-03T14:20:00Z",
    due_date: "2023-12-01T23:59:59Z",
    payment_type: "rent",
    status: "paid",
    method: "cash",
    reference_number: "TXN-231203-001",
    description: "Monthly rent - December 2023",
    late_fee: 48
  },
  {
    id: 4,
    tenant_id: 3,
    amount: 4800,
    payment_date: "2023-06-15T12:00:00Z",
    due_date: "2023-06-15T23:59:59Z",
    payment_type: "deposit",
    status: "paid",
    method: "bank_transfer",
    reference_number: "TXN-230615-001",
    description: "Security deposit",
    late_fee: 0
  }
];

// Mock utility bills
const mockUtilityBills = [
  {
    id: 1,
    tenant_id: 3,
    property_id: 1,
    bill_type: "electricity",
    provider: "DEWA",
    amount: 180,
    due_date: "2024-02-15T23:59:59Z",
    billing_period: "2024-01",
    consumption: 450,
    unit: "kWh",
    status: "pending",
    bill_number: "DEWA-240115-001",
    issue_date: "2024-01-15T00:00:00Z"
  },
  {
    id: 2,
    tenant_id: 3,
    property_id: 1,
    bill_type: "water",
    provider: "DEWA",
    amount: 85,
    due_date: "2024-02-15T23:59:59Z",
    billing_period: "2024-01",
    consumption: 12,
    unit: "cubic meters",
    status: "pending",
    bill_number: "DEWA-240115-002",
    issue_date: "2024-01-15T00:00:00Z"
  },
  {
    id: 3,
    tenant_id: 3,
    property_id: 1,
    bill_type: "internet",
    provider: "Etisalat",
    amount: 299,
    due_date: "2024-02-10T23:59:59Z",
    billing_period: "2024-02",
    status: "paid",
    bill_number: "ETI-240201-001",
    issue_date: "2024-02-01T00:00:00Z",
    payment_date: "2024-02-05T10:30:00Z"
  }
];

// Mock maintenance requests
const mockMaintenanceRequests = [
  {
    id: 1,
    tenant_id: 3,
    property_id: 1,
    issue_type: "plumbing",
    title: "Kitchen sink leakage",
    description: "The kitchen sink has been leaking for the past two days. Water is dripping from under the sink.",
    priority: "medium",
    status: "in_progress",
    submitted_date: "2024-02-10T14:30:00Z",
    scheduled_date: "2024-02-12T10:00:00Z",
    assigned_vendor: "Dubai Plumbing Services",
    vendor_contact: "+971 4 123 4567",
    estimated_cost: 150,
    photos: ["kitchen_sink_1.jpg", "kitchen_sink_2.jpg"],
    tenant_available: "weekdays_morning",
    access_instructions: "Key available with security guard"
  },
  {
    id: 2,
    tenant_id: 3,
    property_id: 1,
    issue_type: "electrical",
    title: "Bedroom light not working",
    description: "The main bedroom ceiling light stopped working yesterday evening.",
    priority: "low",
    status: "completed",
    submitted_date: "2024-02-05T19:45:00Z",
    scheduled_date: "2024-02-07T15:00:00Z",
    completed_date: "2024-02-07T16:30:00Z",
    assigned_vendor: "ElectroFix Dubai",
    vendor_contact: "+971 4 234 5678",
    actual_cost: 75,
    resolution: "Replaced faulty light bulb and checked electrical connections",
    tenant_rating: 5,
    tenant_feedback: "Quick and professional service"
  }
];

// Mock documents
const mockDocuments = [
  {
    id: 1,
    tenant_id: 3,
    document_type: "ejari_certificate",
    title: "Ejari Certificate 2023",
    file_name: "ejari_certificate_2023.pdf",
    file_size: "2.1 MB",
    upload_date: "2023-06-20T00:00:00Z",
    expiry_date: "2024-06-14T23:59:59Z",
    status: "active",
    download_url: "/documents/ejari_certificate_2023.pdf"
  },
  {
    id: 2,
    tenant_id: 3,
    document_type: "lease_agreement",
    title: "Lease Agreement 2023-2024",
    file_name: "lease_agreement_2023.pdf",
    file_size: "1.8 MB",
    upload_date: "2023-06-15T00:00:00Z",
    status: "active",
    download_url: "/documents/lease_agreement_2023.pdf"
  },
  {
    id: 3,
    tenant_id: 3,
    document_type: "security_deposit_receipt",
    title: "Security Deposit Receipt",
    file_name: "deposit_receipt_2023.pdf",
    file_size: "0.5 MB",
    upload_date: "2023-06-15T00:00:00Z",
    status: "active",
    download_url: "/documents/deposit_receipt_2023.pdf"
  }
];

/**
 * Tenant Data Service Class
 */
class TenantDataService {
  /**
   * Get tenant dashboard overview data
   */
  async getTenantDashboard(tenantId) {
    await mockDelay();
    
    const properties = mockTenantProperties.filter(p => p.tenant_id === tenantId);
    const currentProperty = properties[0];
    const lease = mockLeaseAgreements.find(l => l.tenant_id === tenantId);
    const recentPayments = mockPaymentHistory
      .filter(p => p.tenant_id === tenantId)
      .slice(0, 3);
    const pendingBills = mockUtilityBills
      .filter(b => b.tenant_id === tenantId && b.status === 'pending');
    const activeRequests = mockMaintenanceRequests
      .filter(r => r.tenant_id === tenantId && r.status !== 'completed');

    // Calculate lease remaining days
    const leaseEndDate = new Date(lease?.lease_end);
    const today = new Date();
    const remainingDays = Math.ceil((leaseEndDate - today) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      data: {
        current_property: currentProperty,
        lease_info: {
          ...lease,
          remaining_days: remainingDays,
          remaining_months: Math.ceil(remainingDays / 30)
        },
        payment_summary: {
          next_payment_due: "2024-03-01T23:59:59Z",
          next_payment_amount: 2400,
          total_paid_this_year: recentPayments.reduce((sum, p) => sum + p.amount, 0),
          payment_status: "current"
        },
        pending_bills: pendingBills,
        active_maintenance: activeRequests,
        quick_stats: {
          total_properties: properties.length,
          pending_bills_count: pendingBills.length,
          active_requests_count: activeRequests.length,
          lease_renewal_due: remainingDays <= 90
        }
      }
    };
  }

  /**
   * Get tenant properties
   */
  async getTenantProperties(tenantId) {
    await mockDelay();
    
    const properties = mockTenantProperties.filter(p => p.tenant_id === tenantId);
    
    return {
      success: true,
      data: properties
    };
  }

  /**
   * Get lease agreements
   */
  async getLeaseAgreements(tenantId) {
    await mockDelay();
    
    const leases = mockLeaseAgreements.filter(l => l.tenant_id === tenantId);
    
    return {
      success: true,
      data: leases
    };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(tenantId) {
    await mockDelay();
    
    const payments = mockPaymentHistory.filter(p => p.tenant_id === tenantId);
    
    return {
      success: true,
      data: payments
    };
  }

  /**
   * Get utility bills
   */
  async getUtilityBills(tenantId) {
    await mockDelay();
    
    const bills = mockUtilityBills.filter(b => b.tenant_id === tenantId);
    
    return {
      success: true,
      data: bills
    };
  }

  /**
   * Get maintenance requests
   */
  async getMaintenanceRequests(tenantId) {
    await mockDelay();
    
    const requests = mockMaintenanceRequests.filter(r => r.tenant_id === tenantId);
    
    return {
      success: true,
      data: requests
    };
  }

  /**
   * Get tenant documents
   */
  async getTenantDocuments(tenantId) {
    await mockDelay();
    
    const documents = mockDocuments.filter(d => d.tenant_id === tenantId);
    
    return {
      success: true,
      data: documents
    };
  }

  /**
   * Submit maintenance request
   */
  async submitMaintenanceRequest(tenantId, requestData) {
    await mockDelay();
    
    const newRequest = {
      id: mockMaintenanceRequests.length + 1,
      tenant_id: tenantId,
      property_id: requestData.property_id,
      ...requestData,
      status: "pending",
      submitted_date: new Date().toISOString()
    };
    
    mockMaintenanceRequests.push(newRequest);
    
    return {
      success: true,
      data: newRequest,
      message: "Maintenance request submitted successfully"
    };
  }
}

// Create and export singleton instance
export const tenantDataService = new TenantDataService();
export default tenantDataService;
