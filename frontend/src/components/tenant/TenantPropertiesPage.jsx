import React, { useState, useEffect } from 'react';
import { Card, Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { tenantDataService } from '../../services/tenantDataService';

const TenantPropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getTenantProperties(user?.id);
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
            View details of your rented properties and lease information
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={loadProperties}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} loading={true} className="h-96" />
          ))
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500">You don't have any rented properties.</p>
          </div>
        ) : (
          properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 -m-6 mb-6">
                <img
                  src={property.image}
                  alt={property.property_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x300?text=Property+Image';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                    Active Lease
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-90 text-gray-700">
                    {property.property_type}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {property.property_name}
                  </h3>
                  <p className="text-gray-600">Unit: {property.unit_number}</p>
                  <p className="text-sm text-gray-500">{property.address}</p>
                </div>

                {/* Property Specs */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                    <div className="text-gray-500">Bedrooms</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                    <div className="text-gray-500">Bathrooms</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">{property.area_sqft}</div>
                    <div className="text-gray-500">Sq Ft</div>
                  </div>
                </div>

                {/* Lease Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Lease Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Start Date:</span>
                      <p className="font-medium text-blue-900">{formatDate(property.lease_start)}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">End Date:</span>
                      <p className="font-medium text-blue-900">{formatDate(property.lease_end)}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Monthly Rent:</span>
                      <p className="font-semibold text-blue-900">SAR {property.monthly_rent?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Deposit:</span>
                      <p className="font-medium text-blue-900">SAR {property.deposit_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Ejari Information */}
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-900 mb-2">Ejari Certificate</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-emerald-700">Ejari Number:</span>
                      <p className="font-medium text-emerald-900">{property.ejari_number}</p>
                    </div>
                    <div>
                      <span className="text-emerald-700">Expiry Date:</span>
                      <p className="font-medium text-emerald-900">{formatDate(property.ejari_expiry)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-emerald-700">Status:</span>
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                        {property.ejari_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Property Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities?.slice(0, 4).map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                    {property.amenities?.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        +{property.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-600">Landlord:</span> {property.landlord_name}</p>
                    <p><span className="text-gray-600">Phone:</span> {property.landlord_phone}</p>
                    <p><span className="text-gray-600">Manager:</span> {property.property_manager}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <Button variant="primary" size="sm" fullWidth>
                    Contact Landlord
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    Request Maintenance
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantPropertiesPage;
