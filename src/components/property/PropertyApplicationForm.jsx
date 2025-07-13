import React, { useState } from 'react';
import { Card, Button, Select } from '../common';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';

const PropertyApplicationForm = ({ property, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    emirates_id: user?.emirates_id || '',
    nationality: user?.nationality || '',
    date_of_birth: '',
    
    // Employment Information
    employment_status: 'employed',
    employer_name: '',
    job_title: '',
    monthly_income: '',
    employment_duration: '',
    
    // Rental Information
    proposed_move_in_date: '',
    lease_duration: '12',
    number_of_occupants: '1',
    pets: false,
    pet_details: '',
    
    // References
    previous_landlord_name: '',
    previous_landlord_phone: '',
    previous_rental_address: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Additional Information
    additional_notes: '',
    agree_to_terms: false,
    agree_to_background_check: false
  });

  const [errors, setErrors] = useState({});

  const employmentOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self Employed' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' }
  ];

  const leaseDurationOptions = [
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' },
    { value: '24', label: '24 Months' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.emirates_id.trim()) newErrors.emirates_id = 'Emirates ID is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

    // Employment Information
    if (!formData.employer_name.trim()) newErrors.employer_name = 'Employer name is required';
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.monthly_income || formData.monthly_income <= 0) {
      newErrors.monthly_income = 'Valid monthly income is required';
    }

    // Rental Information
    if (!formData.proposed_move_in_date) newErrors.proposed_move_in_date = 'Move-in date is required';

    // Emergency Contact
    if (!formData.emergency_contact_name.trim()) newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone.trim()) newErrors.emergency_contact_phone = 'Emergency contact phone is required';

    // Terms and Conditions
    if (!formData.agree_to_terms) newErrors.agree_to_terms = 'You must agree to the terms and conditions';
    if (!formData.agree_to_background_check) newErrors.agree_to_background_check = 'You must agree to the background check';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const applicationData = {
        ...formData,
        property_id: property.id,
        tenant_id: user?.id,
        owner_id: property.owner_id,
        proposed_rent: property.monthly_rent,
        monthly_income: parseFloat(formData.monthly_income),
        number_of_occupants: parseInt(formData.number_of_occupants),
        lease_duration_months: parseInt(formData.lease_duration)
      };

      const response = await applicationService.submitApplication(applicationData);
      
      if (response.success) {
        onSuccess?.(response.data);
      } else {
        setErrors({ submit: response.error });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Application</h2>
            <p className="text-gray-600 mt-1">
              {property.name} - {property.unit_number}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="emirates_id" className="block text-sm font-medium text-gray-700 mb-1">Emirates ID</label>
                <input
                  type="text"
                  id="emirates_id"
                  name="emirates_id"
                  value={formData.emirates_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.emirates_id ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.emirates_id && <p className="mt-1 text-sm text-red-500">{errors.emirates_id}</p>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default PropertyApplicationForm;
