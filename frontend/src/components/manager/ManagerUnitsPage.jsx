import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Button } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import managerApiService from "../../services/managerApiService";
import notificationService from "../../services/notificationService";
import CreateUnitModal from "./modals/CreateUnitModal";

/**
 * Manager Units Page Component
 * Comprehensive unit management interface for managers
 */
const ManagerUnitsPage = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    property: "",
    status: "",
    type: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load units and properties
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load real data from API
      const [propertiesResponse, unitsResponse] = await Promise.allSettled([
        managerApiService.getProperties({ limit: 100 }),
        managerApiService.getUnits({ limit: 100 }),
      ]);

      // Process properties
      let transformedProperties = [];
      if (
        propertiesResponse.status === "fulfilled" &&
        propertiesResponse.value.success
      ) {
        transformedProperties = propertiesResponse.value.data.map(
          (property) => ({
            id: property.property_id,
            property_number: property.property_number,
            address_line1: property.address_line1,
          })
        );
      }

      // Process units
      let transformedUnits = [];
      if (unitsResponse.status === "fulfilled" && unitsResponse.value.success) {
        // Handle the nested data structure: data.result
        const unitsData =
          unitsResponse.value.data.result || unitsResponse.value.data || [];

        transformedUnits = unitsData.map((unit) => {
          // Find matching property - convert property_id to number for comparison
          const propertyId = parseInt(unit.property_id);
          const property = transformedProperties.find(
            (p) => p.id === propertyId
          ) || {
            id: propertyId,
            property_number: unit.property_number || `PROP-${propertyId}`,
            address_line1: unit.address_line1 || "Property Address",
          };

          return {
            id: unit.unit_id,
            unit_number: unit.unit_number,
            property_id: propertyId,
            property: property,
            type: unit.unit_type || "1BR",
            size_sqm: unit.area_sqm || 75,
            rent_amount: 3500, // Default rent since not in API response
            status: unit.current_status?.toLowerCase() || "vacant",
            floor: 1, // Default floor since not in API response
            bedrooms: unit.num_bedrooms || 1,
            bathrooms: unit.num_bathrooms || 1,
            tenant: null, // Will be populated from contracts if needed
            lease_start: null,
            lease_end: null,
          };
        });
      }

      setProperties(transformedProperties);
      setUnits(transformedUnits);

      // Show success notification
      notificationService.success(
        `Loaded ${transformedUnits.length} units from ${transformedProperties.length} properties successfully!`
      );
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load units data");

      // Show error notification
      notificationService.error("Failed to load units data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Memoize property options for filter to prevent re-renders
  const propertyFilterOptions = useMemo(
    () => [
      { value: "", label: "All Properties" },
      ...properties.map((property) => ({
        value: property.id.toString(),
        label: `${property.property_number} - ${property.address_line1}`,
      })),
    ],
    [properties]
  );

  // Filter units based on search and filters
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.unit_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        unit.property.property_number
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        unit.property.address_line1
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (unit.tenant &&
          (unit.tenant.first_name
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
            unit.tenant.last_name
              .toLowerCase()
              .includes(filters.search.toLowerCase())));

      const matchesProperty =
        !filters.property || unit.property_id.toString() === filters.property;
      const matchesStatus = !filters.status || unit.status === filters.status;
      const matchesType = !filters.type || unit.type === filters.type;

      return matchesSearch && matchesProperty && matchesStatus && matchesType;
    });
  }, [units, filters]);

  // Handle filter changes - memoized to prevent input focus loss
  const handleSearchChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const handlePropertyChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, property: e.target.value }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  }, []);

  const handleTypeChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, type: e.target.value }));
  }, []);

  // Handle unit status update
  const handleStatusUpdate = async (unitId, newStatus) => {
    try {
      const loadingNotification = notificationService.loading(
        "Updating unit status..."
      );

      const response = await managerApiService.updateUnitStatus(
        unitId,
        newStatus
      );

      notificationService.removeNotification(loadingNotification);

      if (response.success) {
        setUnits((prev) =>
          prev.map((unit) =>
            unit.id === unitId ? { ...unit, status: newStatus } : unit
          )
        );
        notificationService.success("Unit status updated successfully!");
      } else {
        throw new Error(response.error || "Failed to update unit status");
      }
    } catch (error) {
      console.error("Error updating unit status:", error);
      notificationService.error(
        "Failed to update unit status. Please try again."
      );
    }
  };

  // Handle opening create unit modal
  const handleCreateUnit = () => {
    setIsCreateModalOpen(true);
  };

  // Handle closing create unit modal
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle successful unit creation
  const handleUnitCreated = (newUnit) => {
    // Transform the new unit to match our component format
    const transformedUnit = {
      id: newUnit.unit_id,
      unit_number: newUnit.unit_number,
      property_id: newUnit.property_id,
      property: properties.find((p) => p.id === newUnit.property_id) || {
        id: newUnit.property_id,
        property_number: `PROP-${newUnit.property_id}`,
        address_line1: "Property Address",
      },
      type: newUnit.unit_type || "1BR",
      size_sqm: newUnit.size_sqm || 75,
      rent_amount: newUnit.rent_amount || 3500,
      status: newUnit.current_status || "vacant",
      floor: newUnit.floor_number || 1,
      bedrooms: newUnit.bedrooms || 1,
      bathrooms: newUnit.bathrooms || 1,
      tenant: null,
      lease_start: null,
      lease_end: null,
    };

    setUnits((prev) => [transformedUnit, ...prev]);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "occupied":
        return "bg-green-100 text-green-800";
      case "vacant":
        return "bg-blue-100 text-blue-800";
      case "for sale":
        return "bg-orange-100 text-orange-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get unique unit types for filter
  const unitTypes = [...new Set(units.map((unit) => unit.type))];

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
            <h1 className="text-3xl font-bold">Unit Management</h1>
            <p className="text-teal-100 mt-2">
              Manage all units across properties
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateUnit}>
            Add Unit
          </Button>
        </div>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Search Units
          </label>
          <input
            type="text"
            placeholder="Search by unit number, property, or tenant..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Property Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Property
          </label>
          <select
            value={filters.property}
            onChange={handlePropertyChange}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            {propertyFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="for sale">For Sale</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        {/* Unit Type Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Unit Type
          </label>
          <select
            value={filters.type}
            onChange={handleTypeChange}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Types</option>
            {unitTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Units Table */}
      {error ? (
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData} variant="primary">
            Retry
          </Button>
        </Card>
      ) : filteredUnits.length === 0 ? (
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Units Found
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search ||
              filters.property ||
              filters.status ||
              filters.type
                ? "No units match your current filters."
                : "Get started by adding your first unit."}
            </p>
            <Button variant="primary">Add Your First Unit</Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {unit.unit_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        Floor {unit.floor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {unit.property.property_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {unit.property.address_line1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{unit.type}</div>
                      <div className="text-sm text-gray-500">
                        {unit.bedrooms}BR/{unit.bathrooms}BA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {unit.size_sqm} sqm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${unit.rent_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          unit.status
                        )}`}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unit.tenant ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {unit.tenant.first_name} {unit.tenant.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {unit.tenant.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No tenant</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/manager/units/${unit.id}`)
                        }
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/manager/units/${unit.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                      {unit.status === "vacant" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(unit.id, "occupied")
                          }
                        >
                          Assign
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

      {/* Create Unit Modal */}
      <CreateUnitModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onUnitCreated={handleUnitCreated}
      />
    </div>
  );
};

export default ManagerUnitsPage;
