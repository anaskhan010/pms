import { useState, useEffect } from 'react';
import { Modal } from '../common';
import notificationService from '../../services/notificationService';
import adminApiService from '../../services/adminApiService';

const FinancialTransactionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onProcessRentPayment,
  transaction = null, 
  buildings,
  apartments,
  tenants
}) => {
  const [formData, setFormData] = useState({
    tenantId: '',
    apartmentId: '',
    contractId: '',
    transactionType: 'Rent Payment',
    amount: '',
    currency: 'AED',
    paymentMethod: 'Bank Transfer',
    transactionDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Completed',
    description: '',
    referenceNumber: '',
    receiptPath: '',
    processingFee: '',
    lateFee: '',
    billingPeriodStart: '',
    billingPeriodEnd: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [availableApartments, setAvailableApartments] = useState([]);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isRentPayment, setIsRentPayment] = useState(false);
  const [tenantAssignments, setTenantAssignments] = useState([]);

  const transactionTypes = [
    'Rent Payment',
    'Security Deposit',
    'Maintenance Fee',
    'Utility Payment',
    'Late Fee',
    'Refund',
    'Other'
  ];

  const paymentMethods = [
    'Bank Transfer',
    'Credit Card',
    'Cash',
    'Cheque',
    'Online Payment'
  ];

  const statusOptions = [
    'Pending',
    'Completed',
    'Failed',
    'Cancelled',
    'Refunded'
  ];

  // Fetch tenant assignments when modal opens
  const fetchTenantAssignments = async () => {
    try {
      const response = await adminApiService.getApartmentAssignments();
      if (response.success) {
        setTenantAssignments(response.data || []);
      } else {
        console.error('Failed to fetch tenant assignments:', response.error);
        setTenantAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching tenant assignments:', error);
      setTenantAssignments([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTenantAssignments();

      if (transaction) {
        // Edit mode
        setFormData({
          tenantId: transaction.tenantId || '',
          apartmentId: transaction.apartmentId || '',
          contractId: transaction.contractId || '',
          transactionType: transaction.transactionType || 'Rent Payment',
          amount: transaction.amount || '',
          currency: transaction.currency || 'AED',
          paymentMethod: transaction.paymentMethod || 'Bank Transfer',
          transactionDate: transaction.transactionDate || new Date().toISOString().split('T')[0],
          dueDate: transaction.dueDate || '',
          status: transaction.status || 'Completed',
          description: transaction.description || '',
          referenceNumber: transaction.referenceNumber || '',
          receiptPath: transaction.receiptPath || '',
          processingFee: transaction.processingFee || '',
          lateFee: transaction.lateFee || '',
          billingPeriodStart: transaction.billingPeriodStart || '',
          billingPeriodEnd: transaction.billingPeriodEnd || ''
        });
        
        if (transaction.apartmentId) {
          // Find building for this apartment
          const apartment = apartments.find(apt => apt.apartmentId === transaction.apartmentId);
          if (apartment) {
            setSelectedBuilding(apartment.buildingId);
          }
        }
      } else {
        // Create mode
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, transaction, apartments]);

  useEffect(() => {
    setIsRentPayment(formData.transactionType === 'Rent Payment');
  }, [formData.transactionType]);

  // Filter apartments based on selected building and tenant
  useEffect(() => {
    if (selectedBuilding && formData.tenantId) {
      // When both building and tenant are selected, show only apartments assigned to that tenant in that building
      const tenantAssignedApartments = apartments.filter(apt => {
        // Check if apartment is in selected building
        const isInBuilding = apt.buildingId === parseInt(selectedBuilding);

        // Check if apartment is assigned to selected tenant
        const isAssignedToTenant = tenantAssignments.some(assignment =>
          assignment.tenantId === parseInt(formData.tenantId) &&
          assignment.apartmentId === apt.apartmentId
        );

        return isInBuilding && isAssignedToTenant;
      });

      setAvailableApartments(tenantAssignedApartments);

      // If no apartments are assigned to this tenant in this building, show message
      if (tenantAssignedApartments.length === 0) {
        console.log('No apartments assigned to this tenant in the selected building');
      }
    } else if (selectedBuilding) {
      // When only building is selected, show all apartments in that building
      const buildingApartments = apartments.filter(apt => apt.buildingId === parseInt(selectedBuilding));
      setAvailableApartments(buildingApartments);
    } else {
      setAvailableApartments([]);
    }

    // Filter tenants based on building selection
    if (selectedBuilding) {
      const buildingTenants = tenants.filter(tenant => {
        // Check if this tenant has any apartment assigned in the selected building
        return tenantAssignments.some(assignment => {
          return assignment.tenantId === tenant.tenantId &&
                 assignment.buildingId === parseInt(selectedBuilding);
        });
      });
      setAvailableTenants(buildingTenants);
    } else {
      setAvailableTenants(tenants); // Show all tenants when no building is selected
    }
  }, [selectedBuilding, formData.tenantId, apartments, tenants, tenantAssignments]);

  useEffect(() => {
    if (formData.tenantId) {
      const tenant = tenants.find(t => t.tenantId === parseInt(formData.tenantId));
      setSelectedTenant(tenant);

      // Only auto-select apartment and building if no building is currently selected
      // This prevents overriding user's building selection
      if (!selectedBuilding) {
        autoSelectTenantApartment(parseInt(formData.tenantId));
      }
    } else {
      setSelectedTenant(null);
      // Reset apartment selection when tenant is cleared
      setFormData(prev => ({
        ...prev,
        apartmentId: ''
      }));
    }
  }, [formData.tenantId, tenants, apartments]);

  // Initialize available tenants when component loads
  useEffect(() => {
    setAvailableTenants(tenants);
  }, [tenants]);

  // Function to auto-select apartment for selected tenant
  const autoSelectTenantApartment = (tenantId) => {
    try {
      // Find the tenant's assigned apartment using tenant assignments
      const tenantAssignment = tenantAssignments.find(assignment =>
        assignment.tenantId === tenantId
      );

      if (tenantAssignment) {
        // Find the apartment details
        const assignedApartment = apartments.find(apt =>
          apt.apartmentId === tenantAssignment.apartmentId
        );

        if (assignedApartment) {
          // Auto-select the apartment and building
          setFormData(prev => ({
            ...prev,
            apartmentId: assignedApartment.apartmentId.toString(),
            contractId: tenantAssignment.contractId ? tenantAssignment.contractId.toString() : ''
          }));

          // Auto-select the building
          setSelectedBuilding(assignedApartment.buildingId.toString());
        }
      }
    } catch (error) {
      console.error('Error auto-selecting tenant apartment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tenantId: '',
      apartmentId: '',
      contractId: '',
      transactionType: 'Rent Payment',
      amount: '',
      currency: 'AED',
      paymentMethod: 'Bank Transfer',
      transactionDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'Completed',
      description: '',
      referenceNumber: '',
      receiptPath: '',
      processingFee: '',
      lateFee: '',
      billingPeriodStart: '',
      billingPeriodEnd: ''
    });
    setSelectedBuilding('');
    setAvailableApartments([]);
    setAvailableTenants(tenants);
    setSelectedTenant(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for tenant selection
    if (name === 'tenantId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        apartmentId: '' // Clear apartment when tenant changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBuildingChange = (e) => {
    const buildingId = e.target.value;
    setSelectedBuilding(buildingId);
    setFormData(prev => ({
      ...prev,
      apartmentId: '' // Clear apartment selection when building changes
      // Don't clear tenant selection - allow building -> tenant -> apartment flow
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transactionType) {
      newErrors.transactionType = 'Transaction type is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    }

    if (isRentPayment) {
      if (!formData.tenantId) {
        newErrors.tenantId = 'Tenant is required for rent payments';
      }
      if (!formData.apartmentId) {
        newErrors.apartmentId = 'Apartment is required for rent payments';
      }
      if (!formData.billingPeriodStart) {
        newErrors.billingPeriodStart = 'Billing period start is required for rent payments';
      }
      if (!formData.billingPeriodEnd) {
        newErrors.billingPeriodEnd = 'Billing period end is required for rent payments';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        processingFee: formData.processingFee ? parseFloat(formData.processingFee) : 0,
        lateFee: formData.lateFee ? parseFloat(formData.lateFee) : 0,
        tenantId: formData.tenantId ? parseInt(formData.tenantId) : null,
        apartmentId: formData.apartmentId ? parseInt(formData.apartmentId) : null,
        contractId: formData.contractId ? parseInt(formData.contractId) : null
      };

      if (isRentPayment && formData.status === 'Completed') {
        // Use special rent payment processing
        await onProcessRentPayment(transactionData);
      } else {
        // Regular transaction save
        await onSave(transactionData);
      }

      // Show success toast notification
      notificationService.success(
        transaction
          ? 'Transaction updated successfully!'
          : 'Transaction created successfully!'
      );

      // Auto-close modal after successful creation/update
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      notificationService.error('An error occurred while saving the transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Financial Transaction' : 'Add Financial Transaction'}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Transaction Type and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type *
            </label>
            <select
              name="transactionType"
              value={formData.transactionType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.transactionType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {transactionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.transactionType && (
              <p className="mt-1 text-sm text-red-600">{errors.transactionType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (AED) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
            )}
          </div>
        </div>

        {/* Tenant and Property Selection (for rent payments) */}
        {isRentPayment && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Rent Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant *
                </label>
                <select
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.tenantId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Tenant</option>
                  {availableTenants.map(tenant => (
                    <option key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.firstName} {tenant.lastName} - {tenant.email}
                    </option>
                  ))}
                </select>
                {errors.tenantId && (
                  <p className="mt-1 text-sm text-red-600">{errors.tenantId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building
                </label>
                <select
                  value={selectedBuilding}
                  onChange={handleBuildingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Building</option>
                  {buildings.map(building => (
                    <option key={building.buildingId} value={building.buildingId}>
                      {building.buildingName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment *
                </label>
                <select
                  name="apartmentId"
                  value={formData.apartmentId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.apartmentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!selectedBuilding}
                >
                  <option value="">
                    {selectedBuilding && formData.tenantId && availableApartments.length === 0
                      ? "No apartments assigned to this tenant"
                      : "Select Apartment"
                    }
                  </option>
                  {availableApartments.map(apartment => (
                    <option key={apartment.apartmentId} value={apartment.apartmentId}>
                      {apartment.number || `Apt ${apartment.apartmentId}`} - AED {apartment.rentPrice}
                    </option>
                  ))}
                </select>
                {errors.apartmentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.apartmentId}</p>
                )}
                {selectedBuilding && formData.tenantId && availableApartments.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    This tenant has no apartments assigned in the selected building
                  </p>
                )}
              </div>
            </div>

            {/* Billing Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period Start *
                </label>
                <input
                  type="date"
                  name="billingPeriodStart"
                  value={formData.billingPeriodStart}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.billingPeriodStart ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingPeriodStart && (
                  <p className="mt-1 text-sm text-red-600">{errors.billingPeriodStart}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period End *
                </label>
                <input
                  type="date"
                  name="billingPeriodEnd"
                  value={formData.billingPeriodEnd}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.billingPeriodEnd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingPeriodEnd && (
                  <p className="mt-1 text-sm text-red-600">{errors.billingPeriodEnd}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Continue with more form fields... */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : (transaction ? 'Update Transaction' : 'Create Transaction')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FinancialTransactionModal;
