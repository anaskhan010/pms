import React, { useState, useEffect } from "react";
import { Card, Button } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import managerApiService from "../../services/managerApiService";
import notificationService from "../../services/notificationService";
import CreateTenantModal from "./modals/CreateTenantModal";

/**
 * Manager Tenants Page Component
 * Comprehensive tenant management interface for managers
 */
const ManagerTenantsPage = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load tenants
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load real data from API
      const response = await managerApiService.getTenants({ limit: 100 });

      if (response.success) {
        // Transform API data to match component expectations
        const transformedTenants = response.data.map((tenant) => ({
          id: tenant.tenant_id,
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          email: tenant.email,
          phone_number: tenant.phone_number,
          date_of_birth: tenant.date_of_birth,
          nationality: tenant.nationality,
          emirates_id: tenant.emirates_id,
          passport_number: tenant.passport_number,
          status: "active", // Default status
          created_at: tenant.created_at,
          current_lease: null, // Will be populated from contracts if needed
          emergency_contact: {
            name: tenant.emergency_contact_name || "Emergency Contact",
            phone: tenant.emergency_contact_phone || "N/A",
            relationship: tenant.emergency_contact_relationship || "N/A",
          },
        }));

        setTenants(transformedTenants);

        // Show success notification
        notificationService.success(
          `Loaded ${transformedTenants.length} tenants successfully!`
        );
      } else {
        throw new Error(response.error || "Failed to load tenants");
      }
    } catch (error) {
      console.error("Error loading tenants:", error);
      setError("Failed to load tenants");

      // Show error notification
      notificationService.error("Failed to load tenants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle tenant status update
  const handleStatusUpdate = async (tenantId, newStatus) => {
    try {
      // Add API call here
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === tenantId ? { ...tenant, status: newStatus } : tenant
        )
      );
    } catch (error) {
      console.error("Error updating tenant status:", error);
      alert("Failed to update tenant status");
    }
  };

  // Handle tenant deletion
  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      try {
        const loadingNotification =
          notificationService.loading("Deleting tenant...");

        const response = await managerApiService.deleteTenant(tenantId);

        notificationService.removeNotification(loadingNotification);

        if (response.success) {
          setTenants((prev) => prev.filter((t) => t.id !== tenantId));
          notificationService.success("Tenant deleted successfully!");
        } else {
          throw new Error(response.error || "Failed to delete tenant");
        }
      } catch (error) {
        console.error("Error deleting tenant:", error);
        notificationService.error("Failed to delete tenant. Please try again.");
      }
    }
  };

  // Handle opening create tenant modal
  const handleCreateTenant = () => {
    setIsCreateModalOpen(true);
  };

  // Handle closing create tenant modal
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle successful tenant creation
  const handleTenantCreated = (newTenant) => {
    const transformedTenant = {
      id: newTenant.tenant_id,
      first_name: newTenant.first_name,
      last_name: newTenant.last_name,
      email: newTenant.email,
      phone_number: newTenant.phone_number,
      date_of_birth: newTenant.date_of_birth,
      nationality: newTenant.nationality,
      emirates_id: newTenant.emirates_id,
      passport_number: newTenant.passport_number,
      status: "active",
      created_at: newTenant.created_at,
      current_lease: null,
      emergency_contact: {
        name: newTenant.emergency_contact_name || "Emergency Contact",
        phone: newTenant.emergency_contact_phone || "N/A",
        relationship: newTenant.emergency_contact_relationship || "N/A",
      },
    };

    setTenants((prev) => [transformedTenant, ...prev]);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
            <h1 className="text-3xl font-bold">Tenant Management</h1>
            <p className="text-teal-100 mt-2">
              Manage all tenants in the system
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateTenant}>
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Tenants Grid */}
      {error ? (
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTenants} variant="primary">
            Retry
          </Button>
        </Card>
      ) : tenants.length === 0 ? (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Tenants Found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first tenant.
            </p>
            <Button variant="primary">Add Your First Tenant</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card
              key={tenant.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tenant.first_name} {tenant.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{tenant.email}</p>
                  <p className="text-sm text-gray-500">{tenant.phone_number}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                    tenant.status
                  )}`}
                >
                  {tenant.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nationality:</span>
                  <span className="font-medium">{tenant.nationality}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Emirates ID:</span>
                  <span className="font-medium">{tenant.emirates_id}</span>
                </div>
                {tenant.current_lease ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Unit:</span>
                      <span className="font-medium">
                        {tenant.current_lease.unit.unit_number}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Property:</span>
                      <span className="font-medium">
                        {tenant.current_lease.unit.property.property_number}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rent:</span>
                      <span className="font-medium text-green-600">
                        ${tenant.current_lease.rent_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lease End:</span>
                      <span className="font-medium">
                        {new Date(
                          tenant.current_lease.lease_end
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No active lease
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Emergency Contact
                </h4>
                <div className="text-sm text-gray-600">
                  <p>{tenant.emergency_contact.name}</p>
                  <p>{tenant.emergency_contact.phone}</p>
                  <p className="text-xs text-gray-500">
                    {tenant.emergency_contact.relationship}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    (window.location.href = `/manager/tenants/${tenant.id}`)
                  }
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/manager/tenants/${tenant.id}/edit`)
                  }
                >
                  Edit
                </Button>
                {tenant.status === "pending" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate(tenant.id, "active")}
                  >
                    Approve
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTenant(tenant.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onTenantCreated={handleTenantCreated}
      />
    </div>
  );
};

export default ManagerTenantsPage;
