import { useState, useEffect } from 'react';

const FinancialTransactionFilters = ({ 
  onFilterChange, 
  buildings, 
  apartments, 
  tenants 
}) => {
  const [filters, setFilters] = useState({
    tenantId: '',
    apartmentId: '',
    buildingId: '',
    transactionType: '',
    status: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [availableApartments, setAvailableApartments] = useState([]);

  const transactionTypes = [
    'Rent Payment',
    'Security Deposit',
    'Maintenance Fee',
    'Utility Payment',
    'Late Fee',
    'Refund',
    'Other'
  ];

  const statusOptions = [
    'Pending',
    'Completed',
    'Failed',
    'Cancelled',
    'Refunded'
  ];

  const paymentMethods = [
    'Bank Transfer',
    'Credit Card',
    'Cash',
    'Cheque',
    'Online Payment'
  ];

  useEffect(() => {
    if (selectedBuilding) {
      const buildingApartments = apartments.filter(apt => apt.buildingId === parseInt(selectedBuilding));
      setAvailableApartments(buildingApartments);
    } else {
      setAvailableApartments(apartments);
    }
  }, [selectedBuilding, apartments]);

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // Remove empty filters
    const activeFilters = Object.keys(newFilters).reduce((acc, key) => {
      if (newFilters[key] !== '') {
        acc[key] = newFilters[key];
      }
      return acc;
    }, {});
    
    onFilterChange(activeFilters);
  };

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
    handleFilterChange('buildingId', value);
    
    // Clear apartment filter when building changes
    if (filters.apartmentId) {
      handleFilterChange('apartmentId', '');
    }
  };

  const clearFilters = () => {
    setFilters({
      tenantId: '',
      apartmentId: '',
      buildingId: '',
      transactionType: '',
      status: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
    setSelectedBuilding('');
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tenant Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tenant
          </label>
          <select
            value={filters.tenantId}
            onChange={(e) => handleFilterChange('tenantId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Tenants</option>
            {tenants.map(tenant => (
              <option key={tenant.tenantId} value={tenant.tenantId}>
                {tenant.firstName} {tenant.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Building Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Building
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => handleBuildingChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Buildings</option>
            {buildings.map(building => (
              <option key={building.buildingId} value={building.buildingId}>
                {building.buildingName}
              </option>
            ))}
          </select>
        </div>

        {/* Apartment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apartment
          </label>
          <select
            value={filters.apartmentId}
            onChange={(e) => handleFilterChange('apartmentId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!selectedBuilding && apartments.length > 50} // Disable if too many apartments and no building selected
          >
            <option value="">All Apartments</option>
            {availableApartments.map(apartment => (
              <option key={apartment.apartmentId} value={apartment.apartmentId}>
                {apartment.number || `Apt ${apartment.apartmentId}`} - AED {apartment.rentPrice}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.transactionType}
            onChange={(e) => handleFilterChange('transactionType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Types</option>
            {transactionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Amount Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Amount (AED)
          </label>
          <input
            type="number"
            value={filters.amountMin}
            onChange={(e) => handleFilterChange('amountMin', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Amount (AED)
          </label>
          <input
            type="number"
            value={filters.amountMax}
            onChange={(e) => handleFilterChange('amountMax', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              let displayValue = value;
              let displayKey = key;

              // Format display names
              switch (key) {
                case 'tenantId':
                  const tenant = tenants.find(t => t.tenantId === parseInt(value));
                  displayValue = tenant ? `${tenant.firstName} ${tenant.lastName}` : value;
                  displayKey = 'Tenant';
                  break;
                case 'buildingId':
                  const building = buildings.find(b => b.buildingId === parseInt(value));
                  displayValue = building ? building.buildingName : value;
                  displayKey = 'Building';
                  break;
                case 'apartmentId':
                  const apartment = apartments.find(a => a.apartmentId === parseInt(value));
                  displayValue = apartment ? (apartment.number || `Apt ${apartment.apartmentId}`) : value;
                  displayKey = 'Apartment';
                  break;
                case 'transactionType':
                  displayKey = 'Type';
                  break;
                case 'paymentMethod':
                  displayKey = 'Method';
                  break;
                case 'dateFrom':
                  displayKey = 'From';
                  displayValue = new Date(value).toLocaleDateString();
                  break;
                case 'dateTo':
                  displayKey = 'To';
                  displayValue = new Date(value).toLocaleDateString();
                  break;
                case 'amountMin':
                  displayKey = 'Min Amount';
                  displayValue = `AED ${parseFloat(value).toLocaleString()}`;
                  break;
                case 'amountMax':
                  displayKey = 'Max Amount';
                  displayValue = `AED ${parseFloat(value).toLocaleString()}`;
                  break;
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                >
                  {displayKey}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-600"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTransactionFilters;
