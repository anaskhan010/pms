/**
 * Payment Service
 * Handles payment processing and transaction management
 */

import { localStorageService } from './localStorageService';

// Mock delay to simulate API calls
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class PaymentService {
  /**
   * Process payment
   */
  async processPayment(paymentData) {
    await mockDelay(1500); // Longer delay to simulate payment processing
    
    try {
      const payment = {
        ...paymentData,
        payment_date: new Date().toISOString(),
        status: 'paid',
        reference_number: this.generateReferenceNumber(),
        processing_fee: this.calculateProcessingFee(paymentData.amount, paymentData.method)
      };
      
      const savedPayment = localStorageService.addItem('payments', payment);
      
      return {
        success: true,
        data: savedPayment,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  /**
   * Get payments
   */
  async getPayments(filters = {}) {
    await mockDelay();
    
    let payments = localStorageService.getData('payments') || [];
    
    // Apply filters
    if (filters.tenant_id) {
      payments = payments.filter(p => p.tenant_id === filters.tenant_id);
    }
    
    if (filters.lease_id) {
      payments = payments.filter(p => p.lease_id === filters.lease_id);
    }
    
    if (filters.status) {
      payments = payments.filter(p => p.status === filters.status);
    }
    
    if (filters.payment_type) {
      payments = payments.filter(p => p.payment_type === filters.payment_type);
    }
    
    if (filters.date_from) {
      payments = payments.filter(p => new Date(p.due_date) >= new Date(filters.date_from));
    }
    
    if (filters.date_to) {
      payments = payments.filter(p => new Date(p.due_date) <= new Date(filters.date_to));
    }
    
    // Enrich with related data
    const enrichedPayments = payments.map(payment => {
      const lease = localStorageService.findById('leases', payment.lease_id);
      const tenant = localStorageService.findById('users', payment.tenant_id);
      const property = lease ? localStorageService.findById('properties', lease.property_id) : null;
      
      return {
        ...payment,
        lease: lease,
        tenant: tenant ? {
          id: tenant.id,
          name: `${tenant.first_name} ${tenant.last_name}`,
          email: tenant.email
        } : null,
        property: property ? {
          id: property.id,
          name: property.name,
          unit_number: property.unit_number,
          address: property.address
        } : null
      };
    });
    
    // Sort by due date (newest first)
    enrichedPayments.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
    
    return {
      success: true,
      data: enrichedPayments
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    await mockDelay();
    
    const payment = localStorageService.findById('payments', id);
    
    if (!payment) {
      return {
        success: false,
        error: 'Payment not found'
      };
    }
    
    return {
      success: true,
      data: payment
    };
  }

  /**
   * Create payment schedule for lease
   */
  async createPaymentSchedule(leaseId) {
    await mockDelay();
    
    try {
      const lease = localStorageService.findById('leases', leaseId);
      
      if (!lease) {
        return {
          success: false,
          error: 'Lease not found'
        };
      }
      
      const payments = [];
      const startDate = new Date(lease.lease_start);
      const endDate = new Date(lease.lease_end);
      
      // Generate monthly payments
      let currentDate = new Date(startDate);
      let paymentNumber = 1;
      
      while (currentDate <= endDate) {
        const dueDate = new Date(currentDate);
        dueDate.setDate(1); // Due on 1st of each month
        
        if (dueDate <= endDate) {
          const payment = {
            lease_id: leaseId,
            tenant_id: lease.tenant_id,
            amount: lease.monthly_rent,
            due_date: dueDate.toISOString(),
            payment_type: 'rent',
            status: 'pending',
            description: `Monthly rent - ${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            payment_number: paymentNumber
          };
          
          payments.push(payment);
          paymentNumber++;
        }
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Save all payments
      const savedPayments = payments.map(payment => 
        localStorageService.addItem('payments', payment)
      );
      
      return {
        success: true,
        data: savedPayments,
        message: 'Payment schedule created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create payment schedule'
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(filters = {}) {
    await mockDelay();
    
    let payments = localStorageService.getData('payments') || [];
    
    // Apply filters
    if (filters.tenant_id) {
      payments = payments.filter(p => p.tenant_id === filters.tenant_id);
    }
    
    if (filters.owner_id) {
      const ownerLeases = localStorageService.findBy('leases', { owner_id: filters.owner_id });
      const leaseIds = ownerLeases.map(l => l.id);
      payments = payments.filter(p => leaseIds.includes(p.lease_id));
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const stats = {
      total_collected: payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
      pending_amount: payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      overdue_amount: payments
        .filter(p => p.status === 'pending' && new Date(p.due_date) < new Date())
        .reduce((sum, p) => sum + p.amount, 0),
      this_month_collected: payments
        .filter(p => {
          const paymentDate = new Date(p.payment_date || p.due_date);
          return p.status === 'paid' && 
                 paymentDate.getFullYear() === currentYear && 
                 paymentDate.getMonth() === currentMonth;
        })
        .reduce((sum, p) => sum + p.amount, 0),
      this_month_pending: payments
        .filter(p => {
          const dueDate = new Date(p.due_date);
          return p.status === 'pending' && 
                 dueDate.getFullYear() === currentYear && 
                 dueDate.getMonth() === currentMonth;
        })
        .reduce((sum, p) => sum + p.amount, 0),
      collection_rate: payments.length > 0 
        ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)
        : 0,
      average_payment: payments.filter(p => p.status === 'paid').length > 0
        ? Math.round(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) / payments.filter(p => p.status === 'paid').length)
        : 0
    };
    
    return {
      success: true,
      data: stats
    };
  }

  /**
   * Get upcoming payments
   */
  async getUpcomingPayments(tenantId, days = 30) {
    await mockDelay();
    
    const payments = localStorageService.getData('payments') || [];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const upcomingPayments = payments.filter(payment => {
      const dueDate = new Date(payment.due_date);
      return payment.tenant_id === tenantId &&
             payment.status === 'pending' &&
             dueDate <= futureDate;
    });
    
    return {
      success: true,
      data: upcomingPayments
    };
  }

  /**
   * Generate reference number
   */
  generateReferenceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `TXN-${year}${month}${day}-${random}`;
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(amount, method) {
    const fees = {
      'credit_card': amount * 0.029, // 2.9%
      'bank_transfer': 5, // Flat fee
      'cash': 0,
      'cheque': 0
    };
    
    return Math.round((fees[method] || 0) * 100) / 100;
  }

  /**
   * Get payment methods
   */
  getPaymentMethods() {
    return [
      { value: 'bank_transfer', label: 'Bank Transfer', fee: 'AED 5 flat fee' },
      { value: 'credit_card', label: 'Credit Card', fee: '2.9% processing fee' },
      { value: 'cash', label: 'Cash', fee: 'No fee' },
      { value: 'cheque', label: 'Cheque', fee: 'No fee' }
    ];
  }
}

// Create and export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
