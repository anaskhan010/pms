import { useState, useEffect } from "react";
import villaApiService from "../../services/villaApiService";
import notificationService from "../../services/notificationService";

const EditVillaModal = ({ isOpen, onClose, onVillaUpdated, villaId }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Address: '',
    bedrooms: '',
    bathrooms: '',
    length: '',
    width: '',
    price: '',
    description: '',
    yearOfCreation: '',
    status: 'Available',
    features: [],
    images: []
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [currentFeature, setCurrentFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch villa data when modal opens
  useEffect(() => {
    if (isOpen && villaId) {
      fetchVillaData();
    }
  }, [isOpen, villaId]);

  const fetchVillaData = async () => {
    try {
      setFetchLoading(true);
      const response = await villaApiService.getVillaById(villaId);
      
      if (response.success) {
        const villa = response.data;
        setFormData({
          Name: villa.Name || '',
          Address: villa.Address || '',
          bedrooms: villa.bedrooms || '',
          bathrooms: villa.bathrooms || '',
          length: villa.length || '',
          width: villa.width || '',
          price: villa.price || '',
          description: villa.description || '',
          yearOfCreation: villa.yearOfCreation ? villa.yearOfCreation.split('T')[0] : '',
          status: villa.status || 'Available',
          features: villa.features || [],
          images: []
        });

        // Fetch existing images
        const imagesResponse = await villaApiService.getVillaImages(villaId);
        if (imagesResponse.success) {
          setExistingImages(imagesResponse.data || []);
        }
      } else {
        notificationService.error('Failed to fetch villa details');
        onClose();
      }
    } catch (error) {
      console.error('Error fetching villa:', error);
      notificationService.error('Failed to fetch villa details');
      onClose();
    } finally {
      setFetchLoading(false);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.imageId !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const addFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) newErrors.Name = 'Villa name is required';
    if (!formData.Address.trim()) newErrors.Address = 'Address is required';
    if (!formData.bedrooms || formData.bedrooms < 1) newErrors.bedrooms = 'Valid number of bedrooms is required';
    if (!formData.bathrooms || formData.bathrooms < 1) newErrors.bathrooms = 'Valid number of bathrooms is required';
    if (!formData.length || formData.length < 1) newErrors.length = 'Valid length is required';
    if (!formData.width || formData.width < 1) newErrors.width = 'Valid width is required';
    if (!formData.price || formData.price < 1) newErrors.price = 'Valid price is required';
    if (!formData.yearOfCreation) newErrors.yearOfCreation = 'Year of creation is required';

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
      // Update villa details
      await villaApiService.updateVilla(villaId, formData);

      // Delete removed images
      for (const imageId of imagesToDelete) {
        try {
          await villaApiService.deleteVillaImage(villaId, imageId);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Add new images if any
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach(image => {
          imageFormData.append('images', image);
        });
        
        try {
          await villaApiService.addVillaImages(villaId, imageFormData);
        } catch (error) {
          console.error('Error adding images:', error);
        }
      }

      notificationService.success('Villa updated successfully');
      onVillaUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating villa:', error);
      notificationService.error(error.message || 'Failed to update villa');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      Name: '',
      Address: '',
      bedrooms: '',
      bathrooms: '',
      length: '',
      width: '',
      price: '',
      description: '',
      yearOfCreation: '',
      status: 'Available',
      features: [],
      images: []
    });
    setExistingImages([]);
    setImagesToDelete([]);
    setCurrentFeature('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-slate-900 to-teal-800 flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-white">Edit Villa</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Villa Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Villa Name *
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.Name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter villa name"
                />
                {errors.Name && <p className="text-red-500 text-sm mt-1">{errors.Name}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.Address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter villa address"
                />
                {errors.Address && <p className="text-red-500 text-sm mt-1">{errors.Address}</p>}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Number of bedrooms"
                />
                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Number of bathrooms"
                />
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (sqm) *
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Length in square meters"
                />
                {errors.length && <p className="text-red-500 text-sm mt-1">{errors.length}</p>}
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (sqm) *
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.width ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Width in square meters"
                />
                {errors.width && <p className="text-red-500 text-sm mt-1">{errors.width}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (SAR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Price in SAR"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Year of Creation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Creation *
                </label>
                <input
                  type="date"
                  name="yearOfCreation"
                  value={formData.yearOfCreation}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.yearOfCreation ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.yearOfCreation && <p className="text-red-500 text-sm mt-1">{errors.yearOfCreation}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Available">Available</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter villa description"
              />
            </div>

            {/* Features */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add a feature"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image) => (
                    <div key={image.imageId} className="relative">
                      <img
                        src={`http://localhost:5000${image.imageUrl}`}
                        alt="Villa"
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.imageId)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can select multiple images to add (max 10 images, 10MB each)
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Updating...' : 'Update Villa'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditVillaModal;
