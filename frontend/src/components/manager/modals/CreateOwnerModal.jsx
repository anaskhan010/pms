import React, { useState, useCallback } from "react";
import managerApiService from "../../../services/managerApiService";
import notificationService from "../../../services/notificationService";

/**
 * CreateOwnerModal - clean and simple
 */
const CreateOwnerModal = ({ isOpen, onClose, onOwnerCreated }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    nationality: "",
    emirates_id: "",
    passport_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const validate = () => {
    const newErrs = {};
    if (!formData.first_name.trim()) newErrs.first_name = "Required";
    if (!formData.last_name.trim()) newErrs.last_name = "Required";
    if (!formData.email.trim()) newErrs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrs.email = "Invalid email";
    if (!formData.phone_number.trim()) newErrs.phone_number = "Required";
    if (!formData.date_of_birth) newErrs.date_of_birth = "Required";
    if (!formData.nationality.trim()) newErrs.nationality = "Required";
    if (!formData.emirates_id.trim()) newErrs.emirates_id = "Required";
    if (!formData.passport_number.trim()) newErrs.passport_number = "Required";

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const loadNotif = notificationService.loading("Creating owner...");
    try {
      const res = await managerApiService.createOwner(formData);
      notificationService.removeNotification(loadNotif);
      if (res.success) {
        notificationService.success("Owner created!");
        onOwnerCreated(res.data);
        handleClose();
      } else throw new Error(res.error);
    } catch {
      notificationService.error("Error creating owner");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      date_of_birth: "",
      nationality: "",
      emirates_id: "",
      passport_number: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
    });
    setErrors({});
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto z-50 pt-10 pb-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 md:p-8 border border-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Create New Owner</h2>
          <button
            onClick={handleClose}
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-xl font-semibold text-black mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  First Name *
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Last Name *
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone *
                </label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+971501234567"
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phone_number}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.date_of_birth}
                  </p>
                )}
              </div>
              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nationality *
                </label>
                <input
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Emirati"
                />
                {errors.nationality && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.nationality}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Identification */}
          <section>
            <h3 className="text-xl font-semibold text-black mb-4">
              Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Emirates ID */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Emirates ID *
                </label>
                <input
                  name="emirates_id"
                  value={formData.emirates_id}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="784-XXXX-XXXXXXX-X"
                />
                {errors.emirates_id && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.emirates_id}
                  </p>
                )}
              </div>
              {/* Passport */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Passport *
                </label>
                <input
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Passport number"
                />
                {errors.passport_number && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.passport_number}
                  </p>
                )}
              </div>
            </div>
          </section>
          {/* Emergency Contact */}
          <section>
            <h3 className="text-xl font-semibold text-black mb-4">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name
                </label>
                <input
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Contact name (optional)"
                />
              </div>
              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone
                </label>
                <input
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+971501234567"
                />
              </div>
              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Relationship
                </label>
                <select
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select relationship</option>
                  <option>Spouse</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Child</option>
                  <option>Friend</option>
                  <option>Colleague</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </section>
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-white hover:bg-gray-100 text-black font-medium rounded-md border border-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-md border border-black"
            >
              {loading ? "Creating..." : "Create Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOwnerModal;
