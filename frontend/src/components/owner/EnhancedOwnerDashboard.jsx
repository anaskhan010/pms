import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { propertyService } from '../../services/propertyService';
import { applicationService } from '../../services/applicationService';
import { paymentService } from '../../services/paymentService';
import PropertyCreateForm from '../property/PropertyCreateForm';

const EnhancedOwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    applications: [],
    payments: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProperty, setShowCreateProperty] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [
        propertiesResponse,
        applicationsResponse,
        paymentsResponse,
        statsResponse
      ] = await Promise.all([
        propertyService.getProperties({ owner_id: user?.id }),
        applicationService.getApplications(),
        paymentService.getPayments(),
        propertyService.getPropertyStats(user?.id)
      ]);

      // Filter applications for owner's properties
      const ownerPropertyIds = propertiesResponse.data?.map(p => p.id) || [];
      const ownerApplications = applicationsResponse.data?.filter(app => 
        ownerPropertyIds.includes(app.property_id)
      ) || [];

      setDashboardData({
        properties: propertiesResponse.data || [],
        applications: ownerApplications,
        payments: paymentsResponse.data || [],
        stats: statsResponse.data || {}
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyCreated = (newProperty) => {
    setDashboardData(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty]
    }));
    setShowCreateProperty(false);
    loadDashboardData(); // Refresh to get updated stats
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      const response = await applicationService.approveApplication(applicationId, {
        approved_by: user?.id,
        lease_start: new Date().toISOString(),
        lease_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      });
      
      if (response.success) {
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      const response = await applicationService.rejectApplication(applicationId, 'Application does not meet requirements');
      
      if (response.success) {
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  if (showCreateProperty) {
    return (
      <PropertyCreateForm
        onSuccess={handlePropertyCreated}
        onCancel={() => setShowCreateProperty(false)}
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="primary">
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your property portfolio and track performance.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadDashboardData}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateProperty(true)}
            variant="primary"
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              dashboardData.stats.total_properties || 0
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Properties</div>
          <div className="text-xs text-blue-600 mt-1">
            {dashboardData.stats.available_properties || 0} available
          </div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `${dashboardData.stats.occupancy_rate || 0}%`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Occupancy Rate</div>
          <div className="text-xs text-emerald-600 mt-1">
            {dashboardData.stats.occupied_properties || 0} occupied
          </div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-3xl font-bold text-amber-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              dashboardData.applications.filter(a => a.status === 'pending').length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pending Applications</div>
          <div className="text-xs text-amber-600 mt-1">Require review</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `AED ${(dashboardData.stats.total_rent_collected || 0).toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Collected</div>
          <div className="text-xs text-purple-600 mt-1">This year</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties Overview */}
        <div className="lg:col-span-2">
          <Card header="Property Portfolio">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.properties.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            {property.bedrooms} bed • {property.bathrooms} bath • {property.area_sqft} sq ft
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            property.status === 'occupied' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : property.status === 'available'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          AED {property.monthly_rent?.toLocaleString()}/mo
                        </div>
                        {property.current_tenant && (
                          <div className="text-sm text-gray-600">
                            {property.current_tenant.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link to="/owner/properties" className="text-teal-600 hover:text-teal-700 font-medium">
                    View All Properties →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first property to the portfolio.</p>
                <Button onClick={() => setShowCreateProperty(true)} variant="primary">
                  Add Your First Property
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Applications */}
        <div className="lg:col-span-1">
          <Card header="Recent Applications">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.applications.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {application.tenant?.name}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {application.property?.name}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            application.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : application.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      {application.status === 'pending' && (
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleApproveApplication(application.id)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs"
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectApplication(application.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                            title="Reject"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No applications yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card header="Quick Actions" className="bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCreateProperty(true)}
            className="group text-center p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 mx-auto mb-3 text-teal-600 group-hover:text-teal-700">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-teal-700">Add Property</h3>
            <p className="text-sm text-gray-500">List a new property</p>
          </button>

          <Link to="/owner/properties" className="group">
            <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 mx-auto mb-3 text-teal-600 group-hover:text-teal-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-teal-700">Manage Properties</h3>
              <p className="text-sm text-gray-500">View all properties</p>
            </div>
          </Link>

          <Link to="/owner/tenants" className="group">
            <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 mx-auto mb-3 text-teal-600 group-hover:text-teal-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-teal-700">Tenant Management</h3>
              <p className="text-sm text-gray-500">Manage tenants</p>
            </div>
          </Link>

          <Link to="/owner/financial" className="group">
            <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 mx-auto mb-3 text-teal-600 group-hover:text-teal-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-teal-700">Financial Reports</h3>
              <p className="text-sm text-gray-500">View financials</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedOwnerDashboard;
