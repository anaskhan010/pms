import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button } from '../common';
import { ownerDataService } from '../../services/ownerDataService';

const OwnerPropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPropertyDetails();
  }, [id]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ownerDataService.getPropertyDetails(id);
      setProperty(response.data);
    } catch (err) {
      console.error('Error loading property details:', err);
      setError('Failed to load property details. Please try again.');
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

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent':
        return 'text-emerald-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-amber-600';
      case 'under_renovation':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financial', label: 'Financial' },
    { id: 'tenants', label: 'Tenants' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'documents', label: 'Documents' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested property could not be found.'}</p>
          <Link to="/owner/properties">
            <Button variant="primary">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/owner/properties" className="hover:text-teal-600">Properties</Link>
            <span>/</span>
            <span>{property.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
          <p className="mt-2 text-gray-600">{property.address}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
          <Button variant="primary">Edit Property</Button>
        </div>
      </div>

      {/* Property Image */}
      <Card className="overflow-hidden">
        <div className="h-64 md:h-96 bg-gray-200">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=Property+Image';
            }}
          />
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-teal-600">{property.total_units}</div>
          <div className="text-sm text-gray-500">Total Units</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{property.occupied_units}</div>
          <div className="text-sm text-gray-500">Occupied</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            SAR {property.monthly_income?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Monthly Income</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            SAR {property.property_value?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Property Value</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header="Property Information">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900 capitalize">{property.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Construction Year</label>
                  <p className="text-gray-900">{property.construction_year}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Condition</label>
                <p className={`font-medium capitalize ${getConditionColor(property.condition)}`}>
                  {property.condition?.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
                <p className="text-gray-900">
                  {new Date(property.last_maintenance).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card header="Amenities">
            <div className="grid grid-cols-2 gap-2">
              {property.amenities?.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header="Income Summary">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Income</span>
                <span className="font-semibold text-emerald-600">
                  SAR {property.monthly_income?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Yearly Income</span>
                <span className="font-semibold text-emerald-600">
                  SAR {(property.monthly_income * 12)?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Occupancy Rate</span>
                <span className="font-semibold text-blue-600">
                  {Math.round((property.occupied_units / property.total_units) * 100)}%
                </span>
              </div>
            </div>
          </Card>

          <Card header="Property Valuation">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Value</span>
                <span className="font-semibold text-purple-600">
                  SAR {property.property_value?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per Unit</span>
                <span className="font-semibold text-gray-900">
                  SAR {Math.round(property.property_value / property.total_units)?.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tenants' && (
        <Card header="Current Tenants">
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-500">Tenant information will be displayed here</p>
            <Link to="/owner/tenants" className="mt-4 inline-block">
              <Button variant="primary">View All Tenants</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'maintenance' && (
        <Card header="Maintenance History">
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <p className="text-gray-500">Maintenance history will be displayed here</p>
            <Link to="/owner/maintenance" className="mt-4 inline-block">
              <Button variant="primary">View Maintenance</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card header="Property Documents">
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">Property documents will be displayed here</p>
            <Button variant="primary">Upload Documents</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OwnerPropertyDetails;
