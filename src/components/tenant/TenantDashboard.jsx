import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { tenantDataService } from '../../services/tenantDataService';
import TenantStatsCards from './TenantStatsCards';
import LeaseOverview from './LeaseOverview';
import PaymentSummary from './PaymentSummary';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getTenantDashboard(user?.id);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
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
            Here's an overview of your rental information and account status
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
          <Link to="/tenant/maintenance">
            <Button variant="primary">
              Request Maintenance
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <TenantStatsCards 
        data={dashboardData?.quick_stats} 
        loading={loading} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property & Lease Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Property */}
          <Card 
            header={
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">My Current Property</h3>
                <Link to="/tenant/properties">
                  <Button variant="secondary" size="sm">
                    View Details →
                  </Button>
                </Link>
              </div>
            }
          >
            {loading ? (
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : dashboardData?.current_property ? (
              <div className="space-y-4">
                <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={dashboardData.current_property.image}
                    alt={dashboardData.current_property.property_name}
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {dashboardData.current_property.property_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Unit: {dashboardData.current_property.unit_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dashboardData.current_property.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-teal-600">
                      SAR {dashboardData.current_property.monthly_rent?.toLocaleString()}/month
                    </p>
                    <p className="text-sm text-gray-500">
                      {dashboardData.current_property.bedrooms} bed, {dashboardData.current_property.bathrooms} bath
                    </p>
                    <p className="text-sm text-gray-500">
                      {dashboardData.current_property.area_sqft} sq ft
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <p className="text-gray-500">No property information available</p>
              </div>
            )}
          </Card>

          {/* Lease Overview */}
          <LeaseOverview 
            data={dashboardData?.lease_info} 
            loading={loading} 
          />

          {/* Recent Activity */}
          <Card header="Recent Activity">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Rent payment processed</p>
                    <p className="text-xs text-gray-500">February 2024 - SAR 2,400</p>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Maintenance request updated</p>
                    <p className="text-xs text-gray-500">Kitchen sink repair - In Progress</p>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Utility bill received</p>
                    <p className="text-xs text-gray-500">DEWA - SAR 265 due Feb 15</p>
                  </div>
                  <span className="text-xs text-gray-500">5 days ago</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Payment & Quick Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <PaymentSummary 
            data={dashboardData?.payment_summary} 
            loading={loading} 
          />

          {/* Pending Bills */}
          <Card header="Pending Bills">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.pending_bills?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.pending_bills.map((bill) => (
                  <div key={bill.id} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {bill.bill_type} - {bill.provider}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {formatDate(bill.due_date)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-amber-700">
                        SAR {bill.amount}
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/tenant/bills">
                  <Button variant="secondary" size="sm" fullWidth>
                    View All Bills
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto h-12 w-12 text-gray-300 mb-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No pending bills</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card header="Quick Actions">
            <div className="space-y-3">
              <Link to="/tenant/payments">
                <Button variant="primary" fullWidth>
                  Make Payment
                </Button>
              </Link>
              <Link to="/tenant/maintenance">
                <Button variant="secondary" fullWidth>
                  Request Maintenance
                </Button>
              </Link>
              <Link to="/tenant/documents">
                <Button variant="ghost" fullWidth>
                  View Documents
                </Button>
              </Link>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card header="Emergency Contact">
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Property Manager</p>
                <p className="text-sm text-gray-600">Al-Rashid Properties</p>
                <a 
                  href="tel:+966559876543" 
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  +966 55 987 6543
                </a>
              </div>
              <div className="text-center pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  For urgent maintenance issues outside business hours
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
