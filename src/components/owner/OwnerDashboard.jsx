import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { ownerDataService } from '../../services/ownerDataService';
import OwnerStatsCards from './OwnerStatsCards';
import PropertyPortfolioOverview from './PropertyPortfolioOverview';
import RecentTenantsTable from './RecentTenantsTable';
import FinancialSummary from './FinancialSummary';
import MaintenanceOverview from './MaintenanceOverview';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    tenants: [],
    financial: null,
    maintenance: [],
    complaints: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [
        propertiesResponse,
        tenantsResponse,
        financialResponse,
        maintenanceResponse,
        complaintsResponse
      ] = await Promise.all([
        ownerDataService.getOwnerProperties(user?.id),
        ownerDataService.getOwnerTenants(user?.id),
        ownerDataService.getFinancialOverview(user?.id),
        ownerDataService.getMaintenanceRequests(user?.id),
        ownerDataService.getComplaints(user?.id)
      ]);

      setDashboardData({
        properties: propertiesResponse.data || [],
        tenants: tenantsResponse.data || [],
        financial: financialResponse.data || null,
        maintenance: maintenanceResponse.data || [],
        complaints: complaintsResponse.data || []
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Here's an overview of your property portfolio and recent activities.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <Button
            onClick={loadDashboardData}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <OwnerStatsCards 
        financial={dashboardData.financial}
        properties={dashboardData.properties}
        loading={loading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Portfolio Overview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PropertyPortfolioOverview 
            properties={dashboardData.properties}
            loading={loading}
          />
        </div>

        {/* Financial Summary - Takes 1 column */}
        <div className="lg:col-span-1">
          <FinancialSummary 
            financial={dashboardData.financial}
            loading={loading}
          />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <RecentTenantsTable 
          tenants={dashboardData.tenants.slice(0, 5)}
          loading={loading}
        />

        {/* Maintenance Overview */}
        <MaintenanceOverview 
          maintenance={dashboardData.maintenance}
          complaints={dashboardData.complaints}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <Card header="Quick Actions" className="bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/owner/properties" className="group">
            <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 mx-auto mb-3 text-teal-600 group-hover:text-teal-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-teal-700">Manage Properties</h3>
              <p className="text-sm text-gray-500">View and manage all properties</p>
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
              <p className="text-sm text-gray-500">View tenant details and leases</p>
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
              <p className="text-sm text-gray-500">Income and expense tracking</p>
            </div>
          </Link>

          <Link to="/owner/maintenance" className="group">
            <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 mx-auto mb-3 text-teal-600 group-hover:text-teal-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-teal-700">Maintenance</h3>
              <p className="text-sm text-gray-500">Track requests and repairs</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
