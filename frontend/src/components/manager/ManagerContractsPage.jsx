import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Button } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import managerApiService from "../../services/managerApiService";
import notificationService from "../../services/notificationService";
import CreateContractModal from "./modals/CreateContractModal";

/**
 * Manager Contracts Page Component
 * Comprehensive contract management interface for managers
 */
const ManagerContractsPage = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    property: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load contracts
  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch contracts from API
      const response = await managerApiService.getContracts({
        page: 1,
        limit: 100, // Get all contracts for now
      });

      if (response.success) {
        // Transform backend data to match frontend expectations
        const transformedContracts = response.data.map((contract) => ({
          id: contract.contract_id,
          contract_number: `CON-${contract.contract_id}`,
          tenant: {
            id: contract.tenant_id,
            first_name: contract.first_name || "Unknown",
            last_name: contract.last_name || "Tenant",
            email:
              contract.tenant_email ||
              `${(contract.first_name || "unknown").toLowerCase()}.${(
                contract.last_name || "tenant"
              ).toLowerCase()}@example.com`,
            phone_number: contract.tenant_phone || "+971501234567",
          },
          unit: {
            id: contract.unit_id,
            unit_number: contract.unit_number || "N/A",
            property: {
              id: contract.property_id,
              property_number: contract.property_number || "N/A",
              address_line1: contract.address_line1 || "N/A",
            },
          },
          owner: {
            id: contract.owner_id,
            first_name: "Owner",
            last_name: "Name",
            email: "owner@example.com",
          },
          rent_amount: parseFloat(contract.monthly_rent_amount) || 0,
          security_deposit: parseFloat(contract.monthly_rent_amount) || 0, // Assuming security deposit equals rent
          lease_start: contract.start_date,
          lease_end: contract.end_date,
          status: contract.contract_status?.toLowerCase() || "pending",
          contract_type: contract.contract_type?.toLowerCase() || "rental",
          payment_frequency:
            contract.payment_frequency?.toLowerCase() || "monthly",
          created_at: contract.created_at,
          signed_date: contract.signed_date,
          next_payment_due: contract.end_date, // Placeholder
        }));

        setContracts(transformedContracts);
      } else {
        throw new Error(response.error || "Failed to fetch contracts");
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      setError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  // Filter contracts based on search and filters
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (contract.contract_number || "").toLowerCase().includes(searchTerm) ||
        (contract.tenant?.first_name || "")
          .toLowerCase()
          .includes(searchTerm) ||
        (contract.tenant?.last_name || "").toLowerCase().includes(searchTerm) ||
        (contract.unit?.unit_number || "").toLowerCase().includes(searchTerm) ||
        (contract.unit?.property?.property_number || "")
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        !filters.status || contract.status === filters.status;

      const matchesProperty =
        !filters.property ||
        (contract.unit?.property?.property_number || "")
          .toLowerCase()
          .includes(filters.property.toLowerCase());

      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [contracts, filters]);

  // Handle filter changes - memoized to prevent input focus loss
  const handleSearchChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  }, []);

  const handlePropertyChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, property: e.target.value }));
  }, []);

  // Handle contract status update
  const handleStatusUpdate = async (contractId, newStatus) => {
    try {
      const response = await managerApiService.updateContractStatus(
        contractId,
        newStatus
      );

      if (response.success) {
        setContracts((prev) =>
          prev.map((contract) =>
            contract.id === contractId
              ? { ...contract, status: newStatus }
              : contract
          )
        );
        notificationService.success("Contract status updated successfully");
      } else {
        throw new Error(response.error || "Failed to update contract status");
      }
    } catch (error) {
      console.error("Error updating contract status:", error);
      notificationService.error("Failed to update contract status");
    }
  };

  // Handle contract renewal
  const handleRenewContract = async (contractId) => {
    try {
      // For now, show a simple prompt for new end date
      const newEndDate = prompt("Enter new end date (YYYY-MM-DD):");
      if (!newEndDate) return;

      const response = await managerApiService.renewContract(contractId, {
        new_end_date: newEndDate,
      });

      if (response.success) {
        // Reload contracts to get updated data
        loadContracts();
        notificationService.success("Contract renewed successfully");
      } else {
        throw new Error(response.error || "Failed to renew contract");
      }
    } catch (error) {
      console.error("Error renewing contract:", error);
      notificationService.error("Failed to renew contract");
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "terminated":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get contract type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if contract is expiring soon (within 30 days)
  const isExpiringSoon = (leaseEnd) => {
    const endDate = new Date(leaseEnd);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Contract Management</h1>
            <p className="text-teal-100 mt-2">
              Manage all rental contracts in the system
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            Create Contract
          </Button>
        </div>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Search Contracts
          </label>
          <input
            type="text"
            placeholder="Search by contract number, tenant, or unit..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Property Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Property
          </label>
          <input
            type="text"
            placeholder="Filter by property number..."
            value={filters.property}
            onChange={handlePropertyChange}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Contracts Table */}
      {error ? (
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadContracts} variant="primary">
            Retry
          </Button>
        </Card>
      ) : filteredContracts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Contracts Found
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status || filters.property
                ? "No contracts match your current filters."
                : "Get started by creating your first contract."}
            </p>
            <Button variant="primary">Create Your First Contract</Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lease Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.contract_number}
                      </div>
                      <div className="flex space-x-1 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                            contract.contract_type
                          )}`}
                        >
                          {contract.contract_type}
                        </span>
                        {isExpiringSoon(contract.lease_end) && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.tenant.first_name} {contract.tenant.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.tenant.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.unit.unit_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.unit.property.property_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${contract.rent_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.payment_frequency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(contract.lease_start).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {new Date(contract.lease_end).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          contract.status
                        )}`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/manager/contracts/${contract.id}`)
                        }
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/manager/contracts/${contract.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                      {contract.status === "pending" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(contract.id, "active")
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {contract.status === "active" &&
                        isExpiringSoon(contract.lease_end) && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleRenewContract(contract.id)}
                          >
                            Renew
                          </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContractCreated={(newContract) => {
          const transformedContract = {
            id: newContract.contract_id,
            contract_number: newContract.contract_number || `CON-${Date.now()}`,
            tenant: {
              id: newContract.tenant_id,
              first_name: "Tenant",
              last_name: "Name",
              email: "tenant@example.com",
              phone_number: "+971501234567",
            },
            unit: {
              id: newContract.unit_id,
              unit_number: "Unit",
              property: {
                id: 1,
                property_number: "PROP-001",
                address_line1: "Property Address",
              },
            },
            owner: {
              id: 1,
              first_name: "Owner",
              last_name: "Name",
              email: "owner@example.com",
            },
            rent_amount: newContract.rent_amount,
            security_deposit: newContract.security_deposit,
            lease_start: newContract.lease_start_date,
            lease_end: newContract.lease_end_date,
            status: newContract.contract_status,
            contract_type: newContract.contract_type,
            payment_frequency: newContract.payment_frequency,
            created_at: new Date().toISOString(),
            signed_date: null,
            next_payment_due: null,
          };
          setContracts((prev) => [transformedContract, ...prev]);
        }}
      />
    </div>
  );
};

export default ManagerContractsPage;
