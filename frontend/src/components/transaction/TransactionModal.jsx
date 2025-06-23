import { useState, useEffect } from 'react';

const TransactionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction = null, 
  buildings,
  apartments,
  tenants
}) => {
  const [formData, setFormData] = useState({
    date: '',
    buildingId: '',
    apartmentId: '',
    tenantId: '',
    type: 'Rent Payment',
    amount: '',
    paymentMethod: 'Bank Transfer',
    status: 'Completed',
    notes: ''
  });
  
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize form data when editing an existing transaction
  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date || '',
        buildingId: transaction.buildingId || '',
        apartmentId: transaction.apartmentId || '',
        tenantId: transaction.tenantId || '',
        type: transaction.type || 'Rent Payment',
        amount: transaction.amount ? transaction.amount.replace(/[^0-9.]/g, '') : '',
        paymentMethod: transaction.paymentMethod || 'Bank Transfer',
        status: transaction.status || 'Completed',
        notes: transaction.notes || ''
      });
      
      // Filter apartments based on selected building
      if (transaction.buildingId) {
        const filtered = apartments.filter(apt => apt.buildingId === parseInt(transaction.buildingId));
        setFilteredApartments(filtered);
      }
    }
  }, [transaction, apartments]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for building selection
    if (name === 'buildingId') {
      // Reset apartment when building changes
      setFormData({
        ...formData,
        [name]: value,
        apartmentId: ''
      });
      
      // Filter apartments based on selected building
      if (value) {
        const filtered = apartments.filter(apt => apt.buildingId === parseInt(value));
        setFilteredApartments(filtered);
      } else {
        setFilteredApartments([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.buildingId) newErrors.buildingId = 'Building is required';
    if (!formData.apartmentId) newErrors.apartmentId = 'Apartment is required';
    if (!formData.tenantId) newErrors.tenantId = 'Tenant is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (isNaN(parseFloat(formData.amount))) newErrors.amount = 'Amount must be a number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format data for saving
      const dataToSave = {
        ...formData,
        id: transaction ? transaction.id : Date.now(),
        // Add building, apartment and tenant names for display
        building: buildings.find(b => b.id === parseInt(formData.buildingId))?.name || '',
        apartment: apartments.find(a => a.id === parseInt(formData.apartmentId))?.number || '',
        tenant: tenants.find(t => t.id === parseInt(formData.tenantId))?.name || '',
        // Format amount for display
        amount: `SAR ${parseFloat(formData.amount).toFixed(2)}`
      };
      
      onSave(dataToSave);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>
            
            {/* Building */}
            <div>
              <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700 mb-1">
                Building <span className="text-red-500">*</span>
              </label>
              <select
                id="buildingId"
                name="buildingId"
                value={formData.buildingId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.buildingId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Building</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
              {errors.buildingId && <p className="mt-1 text-sm text-red-500">{errors.buildingId}</p>}
            </div>
            
            {/* Apartment */}
            <div>
              <label htmlFor="apartmentId" className="block text-sm font-medium text-gray-700 mb-1">
                Apartment <span className="text-red-500">*</span>
              </label>
              <select
                id="apartmentId"
                name="apartmentId"
                value={formData.apartmentId}
                onChange={handleChange}
                disabled={!formData.buildingId}
                className={`w-full px-3 py-2 border ${errors.apartmentId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!formData.buildingId ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select Apartment</option>
                {filteredApartments.map(apartment => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.number}
                  </option>
                ))}
              </select>
              {errors.apartmentId && <p className="mt-1 text-sm text-red-500">{errors.apartmentId}</p>}
            </div>
            
            {/* Tenant */}
            <div>
              <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                Tenant <span className="text-red-500">*</span>
              </label>
              <select
                id="tenantId"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.tenantId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Tenant</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              {errors.tenantId && <p className="mt-1 text-sm text-red-500">{errors.tenantId}</p>}
            </div>
            
            {/* Transaction Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Rent Payment">Rent Payment</option>
                <option value="Security Deposit">Security Deposit</option>
                <option value="Maintenance Fee">Maintenance Fee</option>
                <option value="Utility Payment">Utility Payment</option>
                <option value="Late Fee">Late Fee</option>
                <option value="Refund">Refund</option>
              </select>
            </div>
            
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (SAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">SAR</span>
                </div>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full pl-12 px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>
            
            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Digital Wallet">Digital Wallet</option>
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes here..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {transaction ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
