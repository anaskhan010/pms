import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Input, Select } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import { propertyApiService } from "../../services/propertyApiService";
import managerApiService from "../../services/managerApiService";
import notificationService from "../../services/notificationService";
import AddPropertyModal from "../owner/AddPropertyModal";

/**
 * Manager Properties Page Component
 * Comprehensive property management interface for managers
 */
const ManagerPropertiesPage = () => {
  console.log("Manager Properties componenet has been rendered ...");

  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load real data from API
      const response = await managerApiService.getProperties({
        page: 1,
        limit: 100, // Load more properties for better demo
        ...filters, // Include current filters
      });

      if (response.success) {
        // Transform API data to match component expectations
        const transformedProperties = response.data.map((property) => ({
          id: property.property_id,
          property_number: property.property_number,
          address_line1: property.address_line1,
          address_line2: property.address_line2,
          city: property.city,
          state_province: property.state_province,
          country: property.country,
          postal_code: property.postal_code,
          plot_size_sqm: property.plot_size_sqm,
          total_units: property.total_units,
          description: property.description,
          status: "active", // Default status since backend doesn't have this field
          type: "apartment", // Default type since backend doesn't have this field
          created_at: property.created_at,
          owner: {
            id: 1,
            first_name: "Property",
            last_name: "Owner",
            email: "owner@example.com",
          },
          units: {
            total: property.total_units || 0,
            occupied: Math.floor((property.total_units || 0) * 0.8), // Estimate 80% occupancy
            vacant: Math.floor((property.total_units || 0) * 0.2), // Estimate 20% vacancy
          },
        }));

        setProperties(transformedProperties);

        // Show success notification
        notificationService.success(
          `Loaded ${transformedProperties.length} properties successfully!`
        );
      } else {
        throw new Error(response.error || "Failed to load properties");
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      setError("Failed to load properties");

      // Show error notification
      notificationService.error("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.property_number
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        property.address_line1
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        property.city.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.owner.first_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        property.owner.last_name
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesType = !filters.type || property.type === filters.type;
      const matchesStatus =
        !filters.status || property.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, filters]);

  // Handle filter changes - memoized to prevent input focus loss
  const handleSearchChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const handleTypeChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, type: e.target.value }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  }, []);

  // Handle opening add property modal
  const handleAddProperty = () => {
    setIsAddModalOpen(true);
  };

  // Handle closing add property modal
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  // Handle successful property addition
  const handlePropertyAdded = (newProperty) => {
    setProperties((prev) => [newProperty, ...prev]);
  };

  // Handle property deletion
  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const loadingNotification = notificationService.loading(
          "Deleting property..."
        );

        const response = await managerApiService.deleteProperty(propertyId);

        notificationService.removeNotification(loadingNotification);

        if (response.success) {
          setProperties((prev) => prev.filter((p) => p.id !== propertyId));
          notificationService.success("Property deleted successfully!");
        } else {
          throw new Error(response.error || "Failed to delete property");
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        notificationService.error(
          "Failed to delete property. Please try again."
        );
      }
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "apartment":
        return "bg-blue-100 text-blue-800";
      case "villa":
        return "bg-purple-100 text-purple-800";
      case "commercial":
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
            <h1 className="text-3xl font-bold">Property Management</h1>
            <p className="text-teal-100 mt-2">
              Manage all properties in the system
            </p>
          </div>
          <Button variant="primary" onClick={handleAddProperty}>
            Add Property
          </Button>
        </div>
      </div>

      {/* Filters */}
      {/*  */}

      {/* Properties Grid */}
      {error ? (
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProperties} variant="primary">
            Retry
          </Button>
        </Card>
      ) : filteredProperties.length === 0 ? (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.type || filters.status
                ? "No properties match your current filters."
                : "Get started by adding your first property."}
            </p>
            <Button variant="primary" onClick={handleAddProperty}>
              Add Your First Property
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property.property_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {property.address_line1}
                    {property.address_line2 && `, ${property.address_line2}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {property.city}, {property.country}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                      property.status
                    )}`}
                  >
                    {property.status}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                      property.type
                    )}`}
                  >
                    {property.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Owner:</span>
                  <span className="font-medium">
                    {property.owner.first_name} {property.owner.last_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Units:</span>
                  <span className="font-medium">{property.total_units}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Occupied:</span>
                  <span className="font-medium text-green-600">
                    {property.units.occupied}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vacant:</span>
                  <span className="font-medium text-orange-600">
                    {property.units.vacant}
                  </span>
                </div>
                {property.plot_size_sqm && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plot Size:</span>
                    <span className="font-medium">
                      {property.plot_size_sqm} sqm
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    (window.location.href = `/manager/properties/${property.id}`)
                  }
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/manager/properties/${property.id}/edit`)
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteProperty(property.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onPropertyAdded={handlePropertyAdded}
      />
    </div>
  );
};

export default ManagerPropertiesPage;
