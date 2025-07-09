import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const AddBuildingModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Building Info Tab
    buildingName: '',
    buildingAddress: '',
    buildingImages: [],
    
    // Floors Tab
    floors: [],
    
    // Apartments Tab
    apartments: []
  });

  const [errors, setErrors] = useState({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState({
    building: [],
    floors: {},
    apartments: {}
  });

  const tabs = [
    { id: 0, name: 'Building Info', icon: '🏢' },
    { id: 1, name: 'Floors', icon: '🏗️' },
    { id: 2, name: 'Apartments', icon: '🏠' }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      buildingName: '',
      buildingAddress: '',
      buildingImages: [],
      floors: [],
      apartments: []
    });
    setActiveTab(0);
    setErrors({});
    setImagePreviewUrls({
      building: [],
      floors: {},
      apartments: {}
    });
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const validateCurrentTab = () => {
    const newErrors = {};
    
    switch (activeTab) {
      case 0: // Building Info
        if (!formData.buildingName.trim()) {
          newErrors.buildingName = 'Building name is required';
        }
        if (!formData.buildingAddress.trim()) {
          newErrors.buildingAddress = 'Building address is required';
        }
        break;
      case 1: // Floors
        if (formData.floors.length === 0) {
          newErrors.floors = 'At least one floor is required';
        }
        formData.floors.forEach((floor, index) => {
          if (!floor.floorName.trim()) {
            newErrors[`floor_${index}_name`] = 'Floor name is required';
          }
        });
        break;
      case 2: // Apartments
        if (formData.apartments.length === 0) {
          newErrors.apartments = 'At least one apartment is required';
        }
        formData.apartments.forEach((apartment, index) => {
          if (!apartment.apartmentName.trim()) {
            newErrors[`apartment_${index}_name`] = 'Apartment name is required';
          }
          if (!apartment.description.trim()) {
            newErrors[`apartment_${index}_description`] = 'Apartment description is required';
          }
          if (!apartment.floorId) {
            newErrors[`apartment_${index}_floor`] = 'Floor selection is required';
          }
          if (!apartment.bedrooms || apartment.bedrooms < 1) {
            newErrors[`apartment_${index}_bedrooms`] = 'Bedrooms must be at least 1';
          }
          if (!apartment.bathrooms || apartment.bathrooms < 1) {
            newErrors[`apartment_${index}_bathrooms`] = 'Bathrooms must be at least 1';
          }
          if (!apartment.rentPrice || apartment.rentPrice < 0) {
            newErrors[`apartment_${index}_rentPrice`] = 'Rent price must be greater than 0';
          }
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentTab()) {
      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all tabs
    let allValid = true;
    for (let i = 0; i < tabs.length; i++) {
      setActiveTab(i);
      if (!validateCurrentTab()) {
        allValid = false;
        break;
      }
    }
    
    if (allValid) {
      await onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Building"
      size="full"
      className="max-h-[95vh] max-w-6xl"
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg mr-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 0 && (
            <BuildingInfoTab
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreviewUrls={imagePreviewUrls}
              setImagePreviewUrls={setImagePreviewUrls}
            />
          )}
          {activeTab === 1 && (
            <FloorsTab
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreviewUrls={imagePreviewUrls}
              setImagePreviewUrls={setImagePreviewUrls}
            />
          )}
          {activeTab === 2 && (
            <ApartmentsTab
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreviewUrls={imagePreviewUrls}
              setImagePreviewUrls={setImagePreviewUrls}
            />
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-3">
            {activeTab > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            
            {activeTab < tabs.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                disabled={loading}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Building'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Building Info Tab Component
const BuildingInfoTab = ({ formData, setFormData, errors, imagePreviewUrls, setImagePreviewUrls }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Update form data
    setFormData(prev => ({
      ...prev,
      buildingImages: files
    }));

    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => ({
      ...prev,
      building: previewUrls
    }));
  };

  const removeImage = (index) => {
    const newImages = formData.buildingImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.building.filter((_, i) => i !== index);

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls.building[index]);

    setFormData(prev => ({
      ...prev,
      buildingImages: newImages
    }));

    setImagePreviewUrls(prev => ({
      ...prev,
      building: newPreviewUrls
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Building Information</h3>
        <p className="text-gray-600">Enter the basic information about your building</p>
      </div>

      {/* Building Name */}
      <div>
        <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-2">
          Building Name *
        </label>
        <input
          type="text"
          id="buildingName"
          name="buildingName"
          value={formData.buildingName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.buildingName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter building name"
        />
        {errors.buildingName && (
          <p className="mt-1 text-sm text-red-600">{errors.buildingName}</p>
        )}
      </div>

      {/* Building Address */}
      <div>
        <label htmlFor="buildingAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Building Address *
        </label>
        <textarea
          id="buildingAddress"
          name="buildingAddress"
          value={formData.buildingAddress}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.buildingAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter complete building address"
        />
        {errors.buildingAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.buildingAddress}</p>
        )}
      </div>

      {/* Building Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Building Images
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="buildingImages"
          />
          <label htmlFor="buildingImages" className="cursor-pointer">
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-gray-600">
                <span className="font-medium text-teal-600 hover:text-teal-500">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
            </div>
          </label>
        </div>

        {/* Image Previews */}
        {imagePreviewUrls.building.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images ({imagePreviewUrls.building.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviewUrls.building.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Building preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FloorsTab = ({ formData, setFormData, errors }) => {
  const [newFloorName, setNewFloorName] = React.useState('');

  const addFloor = () => {
    if (!newFloorName.trim()) return;

    const newFloor = {
      id: Date.now(), // Temporary ID for React keys
      floorName: newFloorName.trim()
    };

    setFormData(prev => ({
      ...prev,
      floors: [...prev.floors, newFloor]
    }));

    setNewFloorName(''); // Clear input after adding
  };

  const removeFloor = (floorId) => {
    setFormData(prev => ({
      ...prev,
      floors: prev.floors.filter(floor => floor.id !== floorId)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFloor();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Building Floors</h3>
        <p className="text-gray-600">Add floors to your building by entering floor names</p>
      </div>

      {/* Add Floor Input */}
      <div className="max-w-md mx-auto">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newFloorName}
            onChange={(e) => setNewFloorName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., Ground Floor, First Floor, etc."
          />
          <button
            type="button"
            onClick={addFloor}
            disabled={!newFloorName.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Floor
          </button>
        </div>
      </div>

      {/* Error for no floors */}
      {errors.floors && (
        <div className="text-center">
          <p className="text-sm text-red-600">{errors.floors}</p>
        </div>
      )}

      {/* Floors List */}
      {formData.floors.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h4 className="text-md font-medium text-gray-800 mb-3">Added Floors ({formData.floors.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.floors.map((floor, index) => (
              <div key={floor.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{floor.floorName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFloor(floor.id)}
                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                  title="Remove floor"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {formData.floors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>No floors added yet. Enter a floor name above to get started.</p>
        </div>
      )}
    </div>
  );
};

const ApartmentsTab = ({ formData, setFormData, errors, imagePreviewUrls, setImagePreviewUrls }) => {
  const addApartment = () => {
    const newApartment = {
      id: Date.now(), // Temporary ID for React keys
      apartmentName: '',
      description: '', // Add description field
      bedrooms: 1,
      bathrooms: 1,
      length: '',
      width: '',
      rentPrice: '',
      floorId: '', // Will be selected from available floors
      apartmentImages: [],
      amenities: [] // Add amenities array
    };

    setFormData(prev => ({
      ...prev,
      apartments: [...prev.apartments, newApartment]
    }));

    setImagePreviewUrls(prev => ({
      ...prev,
      apartments: {
        ...prev.apartments,
        [newApartment.id]: []
      }
    }));
  };

  const removeApartment = (apartmentId) => {
    // Revoke image URLs to prevent memory leaks
    if (imagePreviewUrls.apartments[apartmentId]) {
      imagePreviewUrls.apartments[apartmentId].forEach(url => URL.revokeObjectURL(url));
    }

    setFormData(prev => ({
      ...prev,
      apartments: prev.apartments.filter(apartment => apartment.id !== apartmentId)
    }));

    setImagePreviewUrls(prev => {
      const newApartments = { ...prev.apartments };
      delete newApartments[apartmentId];
      return {
        ...prev,
        apartments: newApartments
      };
    });
  };

  const updateApartment = (apartmentId, field, value) => {
    setFormData(prev => ({
      ...prev,
      apartments: prev.apartments.map(apartment =>
        apartment.id === apartmentId ? { ...apartment, [field]: value } : apartment
      )
    }));
  };

  // Amenities management functions
  const addAmenity = (apartmentId, amenityName) => {
    if (!amenityName.trim()) return;

    setFormData(prev => ({
      ...prev,
      apartments: prev.apartments.map(apartment =>
        apartment.id === apartmentId
          ? { ...apartment, amenities: [...apartment.amenities, amenityName.trim()] }
          : apartment
      )
    }));
  };

  const removeAmenity = (apartmentId, amenityIndex) => {
    setFormData(prev => ({
      ...prev,
      apartments: prev.apartments.map(apartment =>
        apartment.id === apartmentId
          ? { ...apartment, amenities: apartment.amenities.filter((_, index) => index !== amenityIndex) }
          : apartment
      )
    }));
  };

  const handleApartmentImageChange = (apartmentId, files) => {
    const fileArray = Array.from(files);

    // Update form data
    updateApartment(apartmentId, 'apartmentImages', fileArray);

    // Create preview URLs
    const previewUrls = fileArray.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => ({
      ...prev,
      apartments: {
        ...prev.apartments,
        [apartmentId]: previewUrls
      }
    }));
  };

  const removeApartmentImage = (apartmentId, imageIndex) => {
    const apartment = formData.apartments.find(a => a.id === apartmentId);
    if (!apartment) return;

    const newImages = apartment.apartmentImages.filter((_, i) => i !== imageIndex);
    const newPreviewUrls = imagePreviewUrls.apartments[apartmentId]?.filter((_, i) => i !== imageIndex) || [];

    // Revoke the URL to prevent memory leaks
    if (imagePreviewUrls.apartments[apartmentId]?.[imageIndex]) {
      URL.revokeObjectURL(imagePreviewUrls.apartments[apartmentId][imageIndex]);
    }

    updateApartment(apartmentId, 'apartmentImages', newImages);

    setImagePreviewUrls(prev => ({
      ...prev,
      apartments: {
        ...prev.apartments,
        [apartmentId]: newPreviewUrls
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Building Apartments</h3>
        <p className="text-gray-600">Add apartments with details and images</p>
        {formData.floors.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Available Floors:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.floors.map((floor, index) => (
                <span key={floor.id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {floor.floorName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Apartment Button */}
      <div className="flex justify-center">
        {formData.floors.length > 0 ? (
          <button
            type="button"
            onClick={addApartment}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Apartment</span>
          </button>
        ) : (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Please add floors first</p>
            <p className="text-yellow-600 text-sm mt-1">You need to create floors before adding apartments</p>
          </div>
        )}
      </div>

      {/* Error for no apartments */}
      {errors.apartments && (
        <div className="text-center">
          <p className="text-sm text-red-600">{errors.apartments}</p>
        </div>
      )}

      {/* Apartments List */}
      {formData.apartments.length > 0 && (
        <div className="space-y-6">
          {formData.apartments.map((apartment, index) => (
            <div key={apartment.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-800">Apartment {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeApartment(apartment.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Apartment Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment Name *
                  </label>
                  <input
                    type="text"
                    value={apartment.apartmentName}
                    onChange={(e) => updateApartment(apartment.id, 'apartmentName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors[`apartment_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Apt 101, Unit A, etc."
                  />
                  {errors[`apartment_${index}_name`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`apartment_${index}_name`]}</p>
                  )}
                </div>

                {/* Floor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor *
                  </label>
                  {formData.floors.length > 0 ? (
                    <select
                      value={apartment.floorId}
                      onChange={(e) => updateApartment(apartment.id, 'floorId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors[`apartment_${index}_floor`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Floor</option>
                      {formData.floors.map((floor) => (
                        <option key={floor.id} value={floor.id}>
                          {floor.floorName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
                      No floors available. Please add floors first.
                    </div>
                  )}
                  {errors[`apartment_${index}_floor`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`apartment_${index}_floor`]}</p>
                  )}
                </div>
              </div>

              {/* Apartment Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment Description *
                </label>
                <textarea
                  value={apartment.description}
                  onChange={(e) => updateApartment(apartment.id, 'description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors[`apartment_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the apartment features, amenities, etc."
                />
                {errors[`apartment_${index}_description`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`apartment_${index}_description`]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={apartment.bedrooms}
                    onChange={(e) => updateApartment(apartment.id, 'bedrooms', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors[`apartment_${index}_bedrooms`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`apartment_${index}_bedrooms`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`apartment_${index}_bedrooms`]}</p>
                  )}
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={apartment.bathrooms}
                    onChange={(e) => updateApartment(apartment.id, 'bathrooms', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors[`apartment_${index}_bathrooms`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`apartment_${index}_bathrooms`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`apartment_${index}_bathrooms`]}</p>
                  )}
                </div>

                {/* Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={apartment.length}
                    onChange={(e) => updateApartment(apartment.id, 'length', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.0"
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={apartment.width}
                    onChange={(e) => updateApartment(apartment.id, 'width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Rent Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent (SAR) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={apartment.rentPrice}
                  onChange={(e) => updateApartment(apartment.id, 'rentPrice', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors[`apartment_${index}_rentPrice`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors[`apartment_${index}_rentPrice`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`apartment_${index}_rentPrice`]}</p>
                )}
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="space-y-3">
                  {/* Add Amenity Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter amenity (e.g., High Speed Internet, Balcony, etc.)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAmenity(apartment.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input');
                        addAmenity(apartment.id, input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Amenities List */}
                  {apartment.amenities && apartment.amenities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Added Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {apartment.amenities.map((amenity, amenityIndex) => (
                          <div
                            key={amenityIndex}
                            className="flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                          >
                            <span>{amenity}</span>
                            <button
                              type="button"
                              onClick={() => removeAmenity(apartment.id, amenityIndex)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Apartment Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleApartmentImageChange(apartment.id, e.target.files)}
                    className="hidden"
                    id={`apartmentImages_${apartment.id}`}
                  />
                  <label htmlFor={`apartmentImages_${apartment.id}`} className="cursor-pointer">
                    <div className="space-y-1">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-teal-600 hover:text-teal-500">Click to upload</span> apartment images
                      </div>
                    </div>
                  </label>
                </div>

                {/* Apartment Image Previews */}
                {imagePreviewUrls.apartments[apartment.id]?.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {imagePreviewUrls.apartments[apartment.id].map((url, imageIndex) => (
                        <div key={imageIndex} className="relative group">
                          <img
                            src={url}
                            alt={`Apartment ${index + 1} preview ${imageIndex + 1}`}
                            className="w-full h-16 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeApartmentImage(apartment.id, imageIndex)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {formData.apartments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h4" />
          </svg>
          <p>No apartments added yet. Click "Add Apartment" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AddBuildingModal;
