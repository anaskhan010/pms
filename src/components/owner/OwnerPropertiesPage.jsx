import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Select } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { ownerDataService } from '../../services/ownerDataService';

const OwnerPropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ownerDataService.getOwnerProperties(user?.id);
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800';
      case 'vacant':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'building':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'villa':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'commercial':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         property.address.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || property.type === filters.type;
    const matchesStatus = !filters.status || property.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = properties.reduce((sum, property) => sum + (property.property_value || 0), 0);
  const totalIncome = properties.reduce((sum, property) => sum + (property.monthly_income || 0), 0);
  const totalUnits = properties.reduce((sum, property) => sum + (property.total_units || 0), 0);
  const occupiedUnits = properties.reduce((sum, property) => sum + (property.occupied_units || 0), 0);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Properties</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadProperties} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your property portfolio
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadProperties}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">
            Add Property
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              properties.length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Properties</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalValue.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Value</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalIncome.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Monthly Income</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? (
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `${Math.round((occupiedUnits / totalUnits) * 100)}%`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Occupancy Rate</div>
        </Card>
      </div>

      {/* Filters */}
      <Card header="Filter Properties">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          
          <Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'building', label: 'Building' },
              { value: 'villa', label: 'Villa' },
              { value: 'commercial', label: 'Commercial' }
            ]}
          />
          
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'vacant', label: 'Vacant' }
            ]}
          />
        </div>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} loading={true} className="h-96" />
          ))
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.type || filters.status 
                ? 'No properties match your current filters.' 
                : 'You haven\'t added any properties yet.'
              }
            </p>
            <Button variant="primary">Add Your First Property</Button>
          </div>
        ) : (
          filteredProperties.map((property) => (
            <Link
              key={property.id}
              to={`/owner/properties/${property.id}`}
              className="group block"
            >
              <Card className="h-full hover:shadow-lg hover:scale-105 transition-all duration-200">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200 -m-6 mb-4">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-white bg-opacity-90 p-2 rounded-full text-teal-600">
                      {getTypeIcon(property.type)}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-sm text-gray-500">{property.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Units:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {property.occupied_units}/{property.total_units}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Income:</span>
                      <span className="ml-1 font-medium text-emerald-600">
                        SAR {property.monthly_income?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Occupancy</span>
                      <span>{Math.round((property.occupied_units / property.total_units) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(property.occupied_units / property.total_units) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Property Value */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Property Value</span>
                      <span className="font-semibold text-gray-900">
                        SAR {property.property_value?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerPropertiesPage;
