import React, { useState } from 'react';
import { Card, Button, Select } from '../common';
import { propertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import notificationService from '../../services/notificationService';

const PropertyCreateForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'apartment',
    address: '',
    city: 'Dubai',
    emirate: 'Dubai',
    postal_code: '',
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: '',
    floor: '',
    unit_number: '',
    monthly_rent: '',
    security_deposit: '',
    commission: '',
    furnished: 'unfurnished',
    parking_spaces: 0,
    balcony: false,
    description: '',
    amenities: [],
    images: []
  });

  const [errors, setErrors] = useState({});

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'penthouse', label: 'Penthouse' }
  ];

  const furnishedOptions = [
    { value: 'unfurnished', label: 'Unfurnished' },
    { value: 'semi-furnished', label: 'Semi-furnished' },
    { value: 'fully-furnished', label: 'Fully-furnished' }
  ];

  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Security', 'Parking', 'Elevator',
    'Balcony', 'Garden', 'Maid Room', 'Storage', 'Concierge',
    'Playground', 'BBQ Area', 'Tennis Court', 'Sauna', 'Steam Room'
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

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageAdd = (imageUrl) => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.area_sqft || formData.area_sqft <= 0) newErrors.area_sqft = 'Valid area is required';
    if (!formData.monthly_rent || formData.monthly_rent <= 0) newErrors.monthly_rent = 'Valid rent amount is required';
    if (!formData.unit_number.trim()) newErrors.unit_number = 'Unit number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Calculate security deposit if not provided
      const securityDeposit = formData.security_deposit || (formData.monthly_rent * 2);
      const commission = formData.commission || (formData.monthly_rent * 0.1);

      const propertyData = {
        ...formData,
        owner_id: user?.id,
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: parseFloat(securityDeposit),
        commission: parseFloat(commission),
        area_sqft: parseInt(formData.area_sqft),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        floor: formData.floor ? parseInt(formData.floor) : null,
        parking_spaces: parseInt(formData.parking_spaces),
        available_from: new Date().toISOString(),
        status: 'available'
      };

      const response = await propertyService.createProperty(propertyData);

      if (response.success) {
        notificationService.success('Property created successfully!');
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Failed to create property';
        notificationService.error(errorMessage);
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      const errorMessage = 'Failed to create property. Please try again.';
      notificationService.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
          <Button variant="ghost" onClick={onCancel}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Marina Heights Tower"
                className={`w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <Select
              label="Property Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={propertyTypes}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className={`w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default PropertyCreateForm;
