import React, { useState, useEffect, useCallback } from "react";
import managerApiService from "../../../services/managerApiService";
import notificationService from "../../../services/notificationService";

/**
 * CreateContractModal - clean and simple
 */
const CreateContractModal = ({ isOpen, onClose, onContractCreated }) => {
  const [formData, setFormData] = useState({
    tenant_id: "",
    unit_id: "",
    rent_amount: "",
    security_deposit: "",
    lease_start_date: "",
    lease_end_date: "",
    contract_status: "draft",
    payment_frequency: "monthly",
    contract_type: "residential",
  });
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }, [errors]);

  // Load tenants and units when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      const [tenantsRes, unitsRes] = await Promise.all([
        managerApiService.getTenants({ limit: 100 }),
        managerApiService.getUnits({ limit: 100 }),
      ]);

      if (tenantsRes.success) {
        setTenants(tenantsRes.data);
      }
      if (unitsRes.success) {
        setUnits(unitsRes.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      notificationService.error("Failed to load data");
    } finally {
      setDataLoading(false);
    }
  };

  const validate = () => {
    const newErrs = {};
    if (!formData.tenant_id) newErrs.tenant_id = "Tenant is required";
    if (!formData.unit_id) newErrs.unit_id = "Unit is required";
    if (!formData.rent_amount || formData.rent_amount <= 0) newErrs.rent_amount = "Valid rent amount is required";
    if (!formData.security_deposit || formData.security_deposit < 0) newErrs.security_deposit = "Valid security deposit is required";
    if (!formData.lease_start_date) newErrs.lease_start_date = "Lease start date is required";
    if (!formData.lease_end_date) newErrs.lease_end_date = "Lease end date is required";

    // Validate date range
    if (formData.lease_start_date && formData.lease_end_date) {
      const startDate = new Date(formData.lease_start_date);
      const endDate = new Date(formData.lease_end_date);
      if (endDate <= startDate) {
        newErrs.lease_end_date = "End date must be after start date";
      }
    }

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const loadNotif = notificationService.loading("Creating contract...");
    try {
      const submitData = {
        ...formData,
        tenant_id: parseInt(formData.tenant_id),
        unit_id: parseInt(formData.unit_id),
        rent_amount: parseFloat(formData.rent_amount),
        security_deposit: parseFloat(formData.security_deposit),
      };

      const res = await managerApiService.createContract(submitData);
      notificationService.removeNotification(loadNotif);
      if (res.success) {
        notificationService.success("Contract created!");
        onContractCreated(res.data);
        handleClose();
      } else throw new Error(res.error);
    } catch {
      notificationService.error("Error creating contract");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setFormData({
      tenant_id: "", unit_id: "", rent_amount: "", security_deposit: "",
      lease_start_date: "", lease_end_date: "", contract_status: "draft",
      payment_frequency: "monthly", contract_type: "residential",
    });
    setErrors({});
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto z-50 pt-10 pb-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-4 sm:p-6 md:p-8 border border-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Create New Contract</h2>
          <button onClick={handleClose} className="text-black hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Tenant *</label>
              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                disabled={dataLoading}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id.toString()}>
                    {tenant.first_name} {tenant.last_name} - {tenant.email}
                  </option>
                ))}
              </select>
              {errors.tenant_id && <p className="text-sm text-red-600 mt-1">{errors.tenant_id}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {dataLoading ? "Loading tenants..." : `${tenants.length} tenants available`}
              </p>
            </div>

            {/* Unit Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Unit *</label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleChange}
                disabled={dataLoading}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id.toString()}>
                    {unit.unit_number} - {unit.unit_type || "Unit"} ({unit.property_number || "N/A"}) - {unit.area_sqm || 0} sqm
                  </option>
                ))}
              </select>
              {errors.unit_id && <p className="text-sm text-red-600 mt-1">{errors.unit_id}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {dataLoading ? "Loading units..." : `${units.length} units available`}
              </p>
            </div>

            {/* Rent Amount Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Rent Amount *</label>
              <input
                type="number"
                name="rent_amount"
                value={formData.rent_amount}
                onChange={handleChange}
                placeholder="e.g., 3500"
                min="1"
                step="0.01"
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.rent_amount && <p className="text-sm text-red-600 mt-1">{errors.rent_amount}</p>}
            </div>

            {/* Security Deposit Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Security Deposit *</label>
              <input
                type="number"
                name="security_deposit"
                value={formData.security_deposit}
                onChange={handleChange}
                placeholder="e.g., 3500"
                min="0"
                step="0.01"
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.security_deposit && <p className="text-sm text-red-600 mt-1">{errors.security_deposit}</p>}
            </div>

            {/* Lease Start Date Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Lease Start Date *</label>
              <input
                type="date"
                name="lease_start_date"
                value={formData.lease_start_date}
                onChange={handleChange}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.lease_start_date && <p className="text-sm text-red-600 mt-1">{errors.lease_start_date}</p>}
            </div>

            {/* Lease End Date Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Lease End Date *</label>
              <input
                type="date"
                name="lease_end_date"
                value={formData.lease_end_date}
                onChange={handleChange}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.lease_end_date && <p className="text-sm text-red-600 mt-1">{errors.lease_end_date}</p>}
            </div>

            {/* Contract Status Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Contract Status</label>
              <select
                name="contract_status"
                value={formData.contract_status}
                onChange={handleChange}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {/* Payment Frequency Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Payment Frequency</label>
              <select
                name="payment_frequency"
                value={formData.payment_frequency}
                onChange={handleChange}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annually">Semi-Annually</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            {/* Contract Type Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Contract Type</label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                className="w-full bg-white text-black border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="short-term">Short-term</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-white hover:bg-gray-100 text-black font-medium rounded-md border border-black"
            >Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-md border border-black"
            >{loading ? 'Creating...' : 'Create Contract'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContractModal;
