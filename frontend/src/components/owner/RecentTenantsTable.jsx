import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Table } from '../common';

const RecentTenantsTable = ({ tenants = [], loading = false }) => {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'current':
        return 'bg-emerald-100 text-emerald-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns = [
    {
      key: 'tenant_info',
      title: 'Tenant',
      render: (_, tenant) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-sm font-medium text-teal-700">
                {tenant.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
            <div className="text-sm text-gray-500">{tenant.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'property_info',
      title: 'Property',
      render: (_, tenant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{tenant.property_name}</div>
          <div className="text-sm text-gray-500">Unit: {tenant.unit_number}</div>
        </div>
      )
    },
    {
      key: 'lease_info',
      title: 'Lease',
      render: (_, tenant) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDate(tenant.lease_start)} - {formatDate(tenant.lease_end)}
          </div>
          <div className="text-sm text-gray-500">
            SAR {tenant.monthly_rent?.toLocaleString()}/month
          </div>
        </div>
      )
    },
    {
      key: 'payment_status',
      title: 'Payment Status',
      render: (_, tenant) => (
        <div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(tenant.payment_status)}`}>
            {tenant.payment_status?.charAt(0).toUpperCase() + tenant.payment_status?.slice(1)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Next: {formatDate(tenant.next_payment)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, tenant) => (
        <div className="flex space-x-2">
          <Link
            to={`/owner/tenants/${tenant.id}`}
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            View
          </Link>
          <Link
            to={`/owner/tenants/${tenant.id}/contact`}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Contact
          </Link>
        </div>
      )
    }
  ];

  return (
    <Card 
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Tenants</h3>
          <Link to="/owner/tenants">
            <Button variant="secondary" size="sm">
              View All Tenants →
            </Button>
          </Link>
        </div>
      }
      className="h-fit"
    >
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tenants Found</h3>
          <p className="text-gray-500 mb-4">You don't have any tenants yet.</p>
          <Button variant="primary">Add First Tenant</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={tenants}
            loading={loading}
            variant="default"
            size="default"
            emptyMessage="No tenants found"
          />
        </div>
      )}

      {/* Summary Stats */}
      {!loading && tenants.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{tenants.length}</div>
              <div className="text-sm text-gray-500">Total Tenants</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {tenants.filter(t => t.payment_status === 'current').length}
              </div>
              <div className="text-sm text-gray-500">Current Payments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {tenants.filter(t => t.payment_status === 'overdue').length}
              </div>
              <div className="text-sm text-gray-500">Overdue Payments</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions for Tenants */}
      {!loading && tenants.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h5>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/owner/tenants/add"
              className="flex items-center justify-center p-3 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Tenant
            </Link>
            <Link
              to="/owner/billing/generate"
              className="flex items-center justify-center p-3 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Bills
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentTenantsTable;
