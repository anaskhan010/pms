import React, { useState, useEffect } from "react";
import managerApiService from "../../../services/managerApiService";

/**
 * CreateUnitModal - simplified black & white styling
 */
const CreateUnitModal = ({ isOpen, onClose, onUnitCreated }) => {
  const [formData, setFormData] = useState({
    property_id: "",
    unit_number: "",
    unit_type: "Residential",
    area_sqm: "",
    num_bedrooms: "",
    num_bathrooms: "",
    current_status: "Vacant",
    description: "",
  });
  const [properties, setProperties] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) loadProperties();
  }, [isOpen]);

  const loadProperties = async () => {
    try {
      const res = await managerApiService.getProperties({ limit: 100 });
      if (res.success) setProperties(res.data);
      else throw new Error(res.error);
    } catch {
      alert("Failed to load properties");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.property_id) errs.property_id = "Property is required";
    if (!formData.unit_number.trim())
      errs.unit_number = "Unit number is required";
    if (
      !formData.area_sqm ||
      isNaN(formData.area_sqm) ||
      Number(formData.area_sqm) <= 0
    ) {
      errs.area_sqm = "Valid size is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      ...formData,
      num_bedrooms: formData.num_bedrooms
        ? parseInt(formData.num_bedrooms, 10)
        : null,
      num_bathrooms: formData.num_bathrooms
        ? parseInt(formData.num_bathrooms, 10)
        : null,
      area_sqm: parseFloat(formData.area_sqm),
    };

    try {
      const res = await managerApiService.createUnit(payload);
      if (res.success) {
        onUnitCreated(res.data);
        closeModal();
      } else {
        alert(res.error || "Failed to create unit");
      }
    } catch {
      alert("Error creating unit");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setFormData({
      property_id: "",
      unit_number: "",
      unit_type: "Residential",
      area_sqm: "",
      num_bedrooms: "",
      num_bathrooms: "",
      current_status: "Vacant",
      description: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0">
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] p-8 border border-gray-400 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Create New Unit</h2>
            <button
              onClick={closeModal}
              className="text-black hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Property *
              </label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="" className="text-gray-500">
                  Select Property
                </option>
                {properties.map((p) => (
                  <option key={p.property_id} value={p.property_id}>
                    {p.property_number} - {p.address_line1}
                  </option>
                ))}
              </select>
              {errors.property_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.property_id}
                </p>
              )}
            </div>
            {/* Unit Number Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Unit Number *
              </label>
              <input
                type="text"
                name="unit_number"
                value={formData.unit_number}
                onChange={handleChange}
                placeholder="e.g., 101"
                className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.unit_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.unit_number}
                </p>
              )}
            </div>
            {/* Type, Size, Bedrooms, Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Unit Type
                </label>
                <select
                  name="unit_type"
                  value={formData.unit_type}
                  onChange={handleChange}
                  className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Size (sqm) *
                </label>
                <input
                  name="area_sqm"
                  value={formData.area_sqm}
                  onChange={handleChange}
                  placeholder="e.g., 75"
                  className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.area_sqm && (
                  <p className="mt-1 text-sm text-red-600">{errors.area_sqm}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="num_bedrooms"
                  value={formData.num_bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="num_bathrooms"
                  value={formData.num_bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Status
              </label>
              <select
                name="current_status"
                value={formData.current_status}
                onChange={handleChange}
                className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option>For Sale</option>
                <option>For Rent</option>
                <option>For Lease</option>
                <option>Occupied</option>
                <option>Vacant</option>
                <option>Maintenance</option>
              </select>
            </div>
            {/* Description */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-black mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows={3}
                className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="px-6 py-2 bg-white hover:bg-gray-100 text-black font-medium rounded-md border border-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-md border border-gray-400"
              >
                {loading ? "Creating..." : "Create Unit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUnitModal;
