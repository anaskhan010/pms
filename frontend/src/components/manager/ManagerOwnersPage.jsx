import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Button } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import managerApiService from "../../services/managerApiService";
import notificationService from "../../services/notificationService";
import CreateOwnerModal from "./modals/CreateOwnerModal";

/**
 * Manager Owners Page Component
 * Comprehensive owner management interface for managers
 */
const ManagerOwnersPage = () => {
  const { user } = useAuth();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load owners
  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API call
      const mockOwners = [
        {
          id: 1,
          first_name: "John",
          last_name: "Smith",
          email: "john.smith@example.com",
          phone_number: "+971501234567",
          date_of_birth: "1975-04-12",
          nationality: "American",
          emirates_id: "784-1975-1234567-1",
          passport_number: "A12345678",
          status: "active",
          created_at: "2024-01-10",
          properties: [
            {
              id: 1,
              property_number: "PROP-001",
              address_line1: "123 Main Street",
              total_units: 10,
              occupied_units: 8,
              monthly_revenue: 35000,
            },
          ],
          total_properties: 1,
          total_units: 10,
          occupied_units: 8,
          monthly_revenue: 35000,
          emergency_contact: {
            name: "Jane Smith",
            phone: "+971501234568",
            relationship: "Spouse",
          },
        },
        {
          id: 2,
          first_name: "Sarah",
          last_name: "Johnson",
          email: "sarah.johnson@example.com",
          phone_number: "+971507654321",
          date_of_birth: "1980-09-25",
          nationality: "British",
          emirates_id: "784-1980-7654321-2",
          passport_number: "B87654321",
          status: "active",
          created_at: "2024-01-20",
          properties: [
            {
              id: 2,
              property_number: "PROP-002",
              address_line1: "456 Oak Avenue",
              total_units: 15,
              occupied_units: 12,
              monthly_revenue: 127500,
            },
          ],
          total_properties: 1,
          total_units: 15,
          occupied_units: 12,
          monthly_revenue: 127500,
          emergency_contact: {
            name: "Michael Johnson",
            phone: "+971507654322",
            relationship: "Brother",
          },
        },
        {
          id: 3,
          first_name: "Ahmed",
          last_name: "Al-Rashid",
          email: "ahmed.rashid@example.com",
          phone_number: "+971509876543",
          date_of_birth: "1970-12-08",
          nationality: "Emirati",
          emirates_id: "784-1970-9876543-3",
          passport_number: "C98765432",
          status: "active",
          created_at: "2024-01-05",
          properties: [
            {
              id: 3,
              property_number: "PROP-003",
              address_line1: "789 Business District",
              total_units: 5,
              occupied_units: 3,
              monthly_revenue: 16500,
            },
          ],
          total_properties: 1,
          total_units: 5,
          occupied_units: 3,
          monthly_revenue: 16500,
          emergency_contact: {
            name: "Fatima Al-Rashid",
            phone: "+971509876544",
            relationship: "Sister",
          },
        },
        {
          id: 4,
          first_name: "Maria",
          last_name: "Rodriguez",
          email: "maria.rodriguez@example.com",
          phone_number: "+971502468135",
          date_of_birth: "1985-07-18",
          nationality: "Spanish",
          emirates_id: "784-1985-2468135-4",
          passport_number: "D24681357",
          status: "pending",
          created_at: "2024-03-01",
          properties: [],
          total_properties: 0,
          total_units: 0,
          occupied_units: 0,
          monthly_revenue: 0,
          emergency_contact: {
            name: "Carlos Rodriguez",
            phone: "+971502468136",
            relationship: "Husband",
          },
        },
      ];

      setOwners(mockOwners);
    } catch (error) {
      console.error("Error loading owners:", error);
      setError("Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  // Filter owners based on search and filters
  const filteredOwners = useMemo(() => {
    return owners.filter((owner) => {
      const matchesSearch =
        owner.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        owner.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        owner.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        owner.phone_number.includes(filters.search) ||
        owner.emirates_id.includes(filters.search);

      const matchesStatus = !filters.status || owner.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [owners, filters]);

  // Handle filter changes - memoized to prevent input focus loss
  const handleSearchChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  }, []);

  // Handle owner status update
  const handleStatusUpdate = async (ownerId, newStatus) => {
    try {
      // Add API call here
      setOwners((prev) =>
        prev.map((owner) =>
          owner.id === ownerId ? { ...owner, status: newStatus } : owner
        )
      );
    } catch (error) {
      console.error("Error updating owner status:", error);
      alert("Failed to update owner status");
    }
  };

  // Handle owner deletion
  const handleDeleteOwner = async (ownerId) => {
    if (window.confirm("Are you sure you want to delete this owner?")) {
      try {
        // Add API call here
        setOwners((prev) => prev.filter((o) => o.id !== ownerId));
      } catch (error) {
        console.error("Error deleting owner:", error);
        alert("Failed to delete owner");
      }
    }
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
            <h1 className="text-3xl font-bold">Owner Management</h1>
            <p className="text-teal-100 mt-2">
              Manage all property owners in the system
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            Add Owner
          </Button>
        </div>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Search Owners
          </label>
          <input
            type="text"
            placeholder="Search by name, email, phone, or Emirates ID..."
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
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Owners Grid */}
      {error ? (
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadOwners} variant="primary">
            Retry
          </Button>
        </Card>
      ) : filteredOwners.length === 0 ? (
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Owners Found
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status
                ? "No owners match your current filters."
                : "Get started by adding your first owner."}
            </p>
            <Button variant="primary">Add Your First Owner</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => (
            <Card
              key={owner.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {owner.first_name} {owner.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{owner.email}</p>
                  <p className="text-sm text-gray-500">{owner.phone_number}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                    owner.status
                  )}`}
                >
                  {owner.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nationality:</span>
                  <span className="font-medium">{owner.nationality}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Emirates ID:</span>
                  <span className="font-medium">{owner.emirates_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Properties:</span>
                  <span className="font-medium">{owner.total_properties}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Units:</span>
                  <span className="font-medium">{owner.total_units}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Occupied Units:</span>
                  <span className="font-medium text-green-600">
                    {owner.occupied_units}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Revenue:</span>
                  <span className="font-medium text-green-600">
                    ${owner.monthly_revenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {owner.properties.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Properties
                  </h4>
                  <div className="space-y-1">
                    {owner.properties.map((property) => (
                      <div key={property.id} className="text-sm text-gray-600">
                        <p className="font-medium">
                          {property.property_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.address_line1} • {property.occupied_units}/
                          {property.total_units} occupied
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Emergency Contact
                </h4>
                <div className="text-sm text-gray-600">
                  <p>{owner.emergency_contact.name}</p>
                  <p>{owner.emergency_contact.phone}</p>
                  <p className="text-xs text-gray-500">
                    {owner.emergency_contact.relationship}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    (window.location.href = `/manager/owners/${owner.id}`)
                  }
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/manager/owners/${owner.id}/edit`)
                  }
                >
                  Edit
                </Button>
                {owner.status === "pending" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate(owner.id, "active")}
                  >
                    Approve
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteOwner(owner.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Owner Modal */}
      <CreateOwnerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOwnerCreated={(newOwner) => {
          const transformedOwner = {
            id: newOwner.owner_id,
            first_name: newOwner.first_name,
            last_name: newOwner.last_name,
            email: newOwner.email,
            phone_number: newOwner.phone_number,
            date_of_birth: newOwner.date_of_birth,
            nationality: newOwner.nationality,
            emirates_id: newOwner.emirates_id,
            passport_number: newOwner.passport_number,
            status: "active",
            created_at: newOwner.created_at,
            properties: [],
            total_properties: 0,
            total_units: 0,
            occupied_units: 0,
            monthly_revenue: 0,
            emergency_contact: {
              name: newOwner.emergency_contact_name || "Emergency Contact",
              phone: newOwner.emergency_contact_phone || "N/A",
              relationship: newOwner.emergency_contact_relationship || "N/A",
            },
          };
          setOwners((prev) => [transformedOwner, ...prev]);
        }}
      />
    </div>
  );
};

export default ManagerOwnersPage;
