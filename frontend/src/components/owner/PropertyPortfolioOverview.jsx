import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';

const PropertyPortfolioOverview = ({ properties = [], loading = false }) => {
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'villa':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'commercial':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  const LoadingCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <Card 
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Property Portfolio</h3>
          <Link to="/owner/properties">
            <Button variant="secondary" size="sm">
              View All Properties →
            </Button>
          </Link>
        </div>
      }
      className="h-fit"
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
          <Button variant="primary">Add Your First Property</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.slice(0, 4).map((property) => (
            <Link
              key={property.id}
              to={`/owner/properties/${property.id}`}
              className="group block"
            >
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-teal-300 transition-all duration-200">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                    <div className="bg-white bg-opacity-90 p-2 rounded-full">
                      {getTypeIcon(property.type)}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    {property.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{property.address}</p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
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
                  <div className="mt-3">
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
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Property Value</span>
                      <span className="font-semibold text-gray-900">
                        SAR {property.property_value?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Show more properties indicator */}
      {properties.length > 4 && (
        <div className="mt-6 text-center">
          <Link to="/owner/properties">
            <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
              View {properties.length - 4} more properties →
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default PropertyPortfolioOverview;
