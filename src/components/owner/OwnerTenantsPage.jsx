import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Select, Table } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { ownerDataService } from '../../services/ownerDataService';

const OwnerTenantsPage = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    property: '',
    paymentStatus: ''
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ownerDataService.getOwnerTenants(user?.id);
      setTenants(response.data || []);
    } catch (err) {
      console.error('Error loading tenants:', err);
      setError('Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                         tenant.property_name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesProperty = !filters.property || tenant.property_name.includes(filters.property);
    const matchesPaymentStatus = !filters.paymentStatus || tenant.payment_status === filters.paymentStatus;
    
    return matchesSearch && matchesProperty && matchesPaymentStatus;
  });

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
            <div className="text-sm text-gray-500">{tenant.phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'property_info',
      title: 'Property & Unit',
      render: (_, tenant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{tenant.property_name}</div>
          <div className="text-sm text-gray-500">Unit: {tenant.unit_number}</div>
        </div>
      )
    },
    {
      key: 'lease_info',
      title: 'Lease Period',
      render: (_, tenant) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDate(tenant.lease_start)}
          </div>
          <div className="text-sm text-gray-500">
            to {formatDate(tenant.lease_end)}
          </div>
        </div>
      )
    },
    {
      key: 'rent_info',
      title: 'Rent & Deposit',
      render: (_, tenant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            SAR {tenant.monthly_rent?.toLocaleString()}/month
          </div>
          <div className="text-sm text-gray-500">
            Deposit: SAR {tenant.deposit?.toLocaleString()}
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
            Last: {formatDate(tenant.last_payment)}
          </div>
          <div className="text-xs text-gray-500">
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
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Contact
          </button>
          <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
            Bill
          </button>
        </div>
      )
    }
  ];

  const currentTenants = filteredTenants.filter(t => t.payment_status === 'current').length;
  const overdueTenants = filteredTenants.filter(t => t.payment_status === 'overdue').length;
  const totalRent = filteredTenants.reduce((sum, tenant) => sum + (tenant.monthly_rent || 0), 0);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tenants</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadTenants} variant="primary">
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
          <h1 className="text-3xl font-bold text-gray-900">My Tenants</h1>
          <p className="mt-2 text-gray-600">
            Manage tenant relationships and track payments
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadTenants}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              filteredTenants.length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Tenants</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              currentTenants
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Current Payments</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              overdueTenants
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Overdue Payments</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalRent.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Monthly Rent</div>
        </Card>
      </div>

      {/* Filters */}
      <Card header="Filter Tenants">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search tenants..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          
          <Input
            placeholder="Filter by property..."
            value={filters.property}
            onChange={(e) => setFilters({ ...filters, property: e.target.value })}
          />
          
          <Select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            options={[
              { value: '', label: 'All Payment Status' },
              { value: 'current', label: 'Current' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'pending', label: 'Pending' }
            ]}
          />
        </div>
      </Card>

      {/* Tenants Table */}
      <Card header={`Tenants (${filteredTenants.length})`}>
        <Table
          columns={columns}
          data={filteredTenants}
          loading={loading}
          emptyMessage="No tenants found"
          variant="default"
        />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card header="Quick Actions" className="bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Generate Monthly Bills
            </Button>
            <Button variant="secondary" fullWidth>
              Send Payment Reminders
            </Button>
            <Button variant="ghost" fullWidth>
              Export Tenant List
            </Button>
          </div>
        </Card>

        <Card header="Payment Overview" className="bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-emerald-600">
                SAR {totalRent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Collected</span>
              <span className="font-semibold text-emerald-600">
                SAR {(totalRent - (overdueTenants * 2400)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding</span>
              <span className="font-semibold text-red-600">
                SAR {(overdueTenants * 2400).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card header="Recent Activity" className="bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Payment received from Sarah Al-Mansouri</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-gray-600">Lease renewal due for Mohammed Al-Ahmed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Payment overdue from Abdullah Trading Co.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerTenantsPage;
