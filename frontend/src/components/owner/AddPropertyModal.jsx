import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Input, Select } from "../common";
import { propertyApiService } from "../../services/propertyApiService";

/**
 * Add Property Modal Component
 * Provides a comprehensive form for creating new properties
 */
const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const [formData, setFormData] = useState({
    property_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    plot_size_sqm: "",
    total_units: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Country options (common countries in the region)
  const countryOptions = [
    { value: "UAE", label: "United Arab Emirates" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "Qatar", label: "Qatar" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Bahrain", label: "Bahrain" },
    { value: "Oman", label: "Oman" },
    { value: "Jordan", label: "Jordan" },
    { value: "Lebanon", label: "Lebanon" },
    { value: "Egypt", label: "Egypt" },
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.property_number.trim()) {
      newErrors.property_number = "Property number is required";
    } else if (formData.property_number.length > 255) {
      newErrors.property_number =
        "Property number cannot exceed 255 characters";
    }

    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = "Address line 1 is required";
    } else if (formData.address_line1.length > 255) {
      newErrors.address_line1 = "Address line 1 cannot exceed 255 characters";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.length > 255) {
      newErrors.city = "City cannot exceed 255 characters";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.length > 255) {
      newErrors.country = "Country cannot exceed 255 characters";
    }

    // Optional field validation
    if (formData.address_line2 && formData.address_line2.length > 255) {
      newErrors.address_line2 = "Address line 2 cannot exceed 255 characters";
    }

    if (formData.state_province && formData.state_province.length > 255) {
      newErrors.state_province = "State/Province cannot exceed 255 characters";
    }

    if (formData.postal_code && formData.postal_code.length > 20) {
      newErrors.postal_code = "Postal code cannot exceed 20 characters";
    }

    // Numeric field validation
    if (
      formData.plot_size_sqm &&
      (isNaN(formData.plot_size_sqm) || parseFloat(formData.plot_size_sqm) < 0)
    ) {
      newErrors.plot_size_sqm = "Plot size must be a positive number";
    }

    if (
      formData.total_units &&
      (isNaN(formData.total_units) || parseInt(formData.total_units) < 1)
    ) {
      newErrors.total_units = "Total units must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API (convert empty strings to null for optional fields)
      const apiData = {
        ...formData,
        address_line2: formData.address_line2 || null,
        state_province: formData.state_province || null,
        postal_code: formData.postal_code || null,
        plot_size_sqm: formData.plot_size_sqm
          ? parseFloat(formData.plot_size_sqm)
          : null,
        total_units: formData.total_units
          ? parseInt(formData.total_units)
          : null,
        description: formData.description || null,
      };

      const result = await propertyApiService.createProperty(apiData);

      if (result.success) {
        // Reset form
        setFormData({
          property_number: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state_province: "",
          postal_code: "",
          country: "",
          plot_size_sqm: "",
          total_units: "",
          description: "",
        });
        setErrors({});

        // Notify parent component
        if (onPropertyAdded) {
          onPropertyAdded(result.data);
        }

        // Close modal
        onClose();
      } else {
        // Handle API errors
        if (typeof result.error === "string") {
          setErrors({ general: result.error });
        } else {
          setErrors({
            general: "Failed to create property. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error creating property:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setFormData({
        property_number: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        plot_size_sqm: "",
        total_units: "",
        description: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Property"
      size="full"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.general}
          </div>
        )}

        {/* Property Number */}
        <Input
          label="Property Number"
          name="property_number"
          value={formData.property_number}
          onChange={handleInputChange}
          error={errors.property_number}
          required
          disabled={loading}
          placeholder="e.g., PROP-001"
          helperText="Unique identifier for the property"
        />

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Address Information
          </h3>

          <Input
            label="Address Line 1"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleInputChange}
            error={errors.address_line1}
            required
            disabled={loading}
            placeholder="e.g., 123 Main Street"
          />

          <Input
            label="Address Line 2"
            name="address_line2"
            value={formData.address_line2}
            onChange={handleInputChange}
            error={errors.address_line2}
            disabled={loading}
            placeholder="e.g., Suite 100, Building A (optional)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              error={errors.city}
              required
              disabled={loading}
              placeholder="e.g., Dubai"
            />

            <Input
              label="State/Province"
              name="state_province"
              value={formData.state_province}
              onChange={handleInputChange}
              error={errors.state_province}
              disabled={loading}
              placeholder="e.g., Dubai (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              error={errors.postal_code}
              disabled={loading}
              placeholder="e.g., 12345 (optional)"
            />

            <Select
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              error={errors.country}
              required
              disabled={loading}
              options={countryOptions}
              placeholder="Select a country"
            />
          </div>
        </div>

        {/* Property Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Property Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plot Size (sqm)"
              name="plot_size_sqm"
              type="number"
              value={formData.plot_size_sqm}
              onChange={handleInputChange}
              error={errors.plot_size_sqm}
              disabled={loading}
              placeholder="e.g., 1000"
              helperText="Plot size in square meters (optional)"
              min="0"
              step="0.01"
            />

            <Input
              label="Total Units"
              name="total_units"
              type="number"
              value={formData.total_units}
              onChange={handleInputChange}
              error={errors.total_units}
              disabled={loading}
              placeholder="e.g., 10"
              helperText="Number of units in the property (optional)"
              min="1"
              step="1"
            />
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={4}
              className="form-input"
              placeholder="Enter property description (optional)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Additional details about the property
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            {loading ? "Creating Property..." : "Create Property"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

AddPropertyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPropertyAdded: PropTypes.func,
};

export default AddPropertyModal;
