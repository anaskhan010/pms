import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';

const AssignApartmentModal = ({ 
  isOpen, 
  onClose, 
  apartment, 
  onAssignmentSuccess 
}) => {
  const [formData, setFormData] = useState({
    tenantId: '',
    startDate: '',
    endDate: '',
    securityFee: ''
  });
  
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadAvailableTenants();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      tenantId: '',
      startDate: '',
      endDate: '',
      securityFee: apartment?.rentPrice ? apartment.rentPrice * 2 : ''
    });
    setErrors({});
  };

  const loadAvailableTenants = async () => {
    try {
      setLoadingTenants(true);
      console.log('Loading available tenants...');
      const response = await adminApiService.getAvailableTenantsForAssignment();
      console.log('Available tenants response:', response);
      if (response.success) {
        setAvailableTenants(response.data);
        console.log('Available tenants set:', response.data);
      } else {
        console.error('Failed to load tenants:', response.error);
        notificationService.error('Failed to load available tenants');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      notificationService.error('Error loading available tenants');
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenantId) {
      newErrors.tenantId = 'Please select a tenant';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.securityFee && isNaN(formData.securityFee)) {
      newErrors.securityFee = 'Security fee must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!apartment || !apartment.apartmentId) {
      notificationService.error('Invalid apartment data. Please try again.');
      return;
    }

    try {
      setLoading(true);

      console.log('Assignment data:', {
        tenantId: formData.tenantId,
        apartmentId: apartment.apartmentId,
        apartment: apartment
      });

      const assignmentData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        securityFee: parseFloat(formData.securityFee) || 0
      };

      const response = await adminApiService.assignApartmentToTenant(
        formData.tenantId,
        apartment.apartmentId,
        assignmentData
      );

      if (response.success) {
        notificationService.success('Apartment assigned successfully with contract created');
        onAssignmentSuccess && onAssignmentSuccess();
        onClose();
      } else {
        notificationService.error(`Failed to assign apartment: ${response.error}`);
      }
    } catch (error) {
      console.error('Error assigning apartment:', error);
      notificationService.error('An error occurred while assigning the apartment');
    } finally {
      setLoading(false);
    }
  };

  const selectedTenant = availableTenants.find(t => t.tenantId === parseInt(formData.tenantId));

  // Don't render modal if apartment data is invalid
  if (!apartment || !apartment.apartmentId) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Apartment to Tenant"
      size="default"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Apartment Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Apartment Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Apartment:</span>
              <span className="ml-2 font-medium">{apartment?.number}</span>
            </div>
            <div>
              <span className="text-gray-600">Rent:</span>
              <span className="ml-2 font-medium">AED {apartment?.rentPrice?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Bedrooms:</span>
              <span className="ml-2 font-medium">{apartment?.bedrooms}</span>
            </div>
            <div>
              <span className="text-gray-600">Floor:</span>
              <span className="ml-2 font-medium">{apartment?.floor}</span>
            </div>
          </div>
        </div>

        {/* Tenant Selection */}
        <div>
          <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Tenant *
          </label>
          {loadingTenants ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
              <span className="ml-2 text-gray-600">Loading tenants...</span>
            </div>
          ) : (
            <select
              id="tenantId"
              name="tenantId"
              value={formData.tenantId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.tenantId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a tenant...</option>
              {availableTenants.map(tenant => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.firstName} {tenant.lastName} - {tenant.email}
                </option>
              ))}
            </select>
          )}
          {errors.tenantId && (
            <p className="mt-1 text-sm text-red-600">{errors.tenantId}</p>
          )}
        </div>

        {/* Selected Tenant Info */}
        {selectedTenant && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Selected Tenant</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600">Name:</span>
                <span className="ml-2">{selectedTenant.firstName} {selectedTenant.lastName}</span>
              </div>
              <div>
                <span className="text-blue-600">Email:</span>
                <span className="ml-2">{selectedTenant.email}</span>
              </div>
              <div>
                <span className="text-blue-600">Phone:</span>
                <span className="ml-2">{selectedTenant.phoneNumber}</span>
              </div>
              <div>
                <span className="text-blue-600">Occupation:</span>
                <span className="ml-2">{selectedTenant.occupation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Contract Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Contract Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Contract Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Contract End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="securityFee" className="block text-sm font-medium text-gray-700 mb-2">
              Security Fee (AED)
            </label>
            <input
              type="number"
              id="securityFee"
              name="securityFee"
              value={formData.securityFee}
              onChange={handleInputChange}
              placeholder="Enter security fee amount"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.securityFee ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.securityFee && (
              <p className="mt-1 text-sm text-red-600">{errors.securityFee}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Suggested: AED {apartment?.rentPrice ? (apartment.rentPrice * 2).toLocaleString() : '0'} (2x monthly rent)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || loadingTenants}
          >
            {loading ? 'Assigning...' : 'Assign Apartment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignApartmentModal;
