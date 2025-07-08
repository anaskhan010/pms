import { useState, useCallback } from "react";

const TransactionFilters = ({
  onFilterChange,
  buildings,
  apartments,
  tenants,
  transactionTypes,
}) => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  // Filter apartments based on selected building
  const filteredApartments = selectedBuilding
    ? apartments.filter((apt) => apt.buildingId === parseInt(selectedBuilding))
    : apartments;

  // Handle building selection
  const handleBuildingChange = useCallback(
    (e) => {
      const buildingId = e.target.value;
      setSelectedBuilding(buildingId);
      setSelectedApartment(""); // Reset apartment when building changes

      // Apply filters
      onFilterChange({
        building: buildingId,
        apartment: "",
        tenant: selectedTenant,
        type: selectedType,
        status: selectedStatus,
        dateRange,
        amountRange,
      });
    },
    [
      selectedTenant,
      selectedType,
      selectedStatus,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Handle apartment selection
  const handleApartmentChange = useCallback(
    (e) => {
      const apartmentId = e.target.value;
      setSelectedApartment(apartmentId);

      // Apply filters
      onFilterChange({
        building: selectedBuilding,
        apartment: apartmentId,
        tenant: selectedTenant,
        type: selectedType,
        status: selectedStatus,
        dateRange,
        amountRange,
      });
    },
    [
      selectedBuilding,
      selectedTenant,
      selectedType,
      selectedStatus,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Handle tenant selection
  const handleTenantChange = useCallback(
    (e) => {
      const tenantId = e.target.value;
      setSelectedTenant(tenantId);

      // Apply filters
      onFilterChange({
        building: selectedBuilding,
        apartment: selectedApartment,
        tenant: tenantId,
        type: selectedType,
        status: selectedStatus,
        dateRange,
        amountRange,
      });
    },
    [
      selectedBuilding,
      selectedApartment,
      selectedType,
      selectedStatus,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Handle transaction type selection
  const handleTypeChange = useCallback(
    (e) => {
      const type = e.target.value;
      setSelectedType(type);

      // Apply filters
      onFilterChange({
        building: selectedBuilding,
        apartment: selectedApartment,
        tenant: selectedTenant,
        type,
        status: selectedStatus,
        dateRange,
        amountRange,
      });
    },
    [
      selectedBuilding,
      selectedApartment,
      selectedTenant,
      selectedStatus,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Handle status selection
  const handleStatusChange = useCallback(
    (e) => {
      const status = e.target.value;
      setSelectedStatus(status);

      // Apply filters
      onFilterChange({
        building: selectedBuilding,
        apartment: selectedApartment,
        tenant: selectedTenant,
        type: selectedType,
        status,
        dateRange,
        amountRange,
      });
    },
    [
      selectedBuilding,
      selectedApartment,
      selectedTenant,
      selectedType,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Handle date range changes
  const handleDateChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const newDateRange = { ...dateRange, [name]: value };
      setDateRange(newDateRange);

      // Apply filters
      onFilterChange({
        building: selectedBuilding,
        apartment: selectedApartment,
        tenant: selectedTenant,
        type: selectedType,
        status: selectedStatus,
        dateRange: newDateRange,
        amountRange,
      });
    },
    [
      selectedBuilding,
      selectedApartment,
      selectedTenant,
      selectedType,
      selectedStatus,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Handle amount range changes
  const handleAmountChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const newAmountRange = { ...amountRange, [name]: value };
      setAmountRange(newAmountRange);

      // Apply filters
      onFilterChange({
        building: selectedBuilding,
        apartment: selectedApartment,
        tenant: selectedTenant,
        type: selectedType,
        status: selectedStatus,
        dateRange,
        amountRange: newAmountRange,
      });
    },
    [
      selectedBuilding,
      selectedApartment,
      selectedTenant,
      selectedType,
      selectedStatus,
      dateRange,
      amountRange,
      onFilterChange,
    ]
  );

  // Reset all filters
  const resetFilters = () => {
    setSelectedBuilding("");
    setSelectedApartment("");
    setSelectedTenant("");
    setSelectedType("");
    setSelectedStatus("");
    setDateRange({ from: "", to: "" });
    setAmountRange({ min: "", max: "" });

    // Apply reset
    onFilterChange({
      building: "",
      apartment: "",
      tenant: "",
      type: "",
      status: "",
      dateRange: { from: "", to: "" },
      amountRange: { min: "", max: "" },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Filter Transactions
        </h2>
        <button
          onClick={resetFilters}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Building Filter */}
        <div>
          <label
            htmlFor="building"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Building
          </label>
          <select
            id="building"
            value={selectedBuilding}
            onChange={handleBuildingChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Buildings</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>

        {/* Apartment Filter */}
        <div>
          <label
            htmlFor="apartment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Apartment
          </label>
          <select
            id="apartment"
            value={selectedApartment}
            onChange={handleApartmentChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedBuilding}
          >
            <option value="">All Apartments</option>
            {filteredApartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.number}
              </option>
            ))}
          </select>
        </div>

        {/* Tenant Filter */}
        <div>
          <label
            htmlFor="tenant"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tenant
          </label>
          <select
            id="tenant"
            value={selectedTenant}
            onChange={handleTenantChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type Filter */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Transaction Type
          </label>
          <select
            id="type"
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {transactionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="from"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date From
            </label>
            <input
              type="date"
              id="from"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date To
            </label>
            <input
              type="date"
              id="to"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Amount Range Filter */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="min"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Min Amount (SAR)
            </label>
            <input
              type="number"
              id="min"
              name="min"
              value={amountRange.min}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min amount"
              min="0"
            />
          </div>
          <div>
            <label
              htmlFor="max"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Max Amount (SAR)
            </label>
            <input
              type="number"
              id="max"
              name="max"
              value={amountRange.max}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Max amount"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
