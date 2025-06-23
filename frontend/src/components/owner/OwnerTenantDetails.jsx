import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button } from '../common';
import { ownerDataService } from '../../services/ownerDataService';

const OwnerTenantDetails = () => {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadTenantDetails();
  }, [id]);

  const loadTenantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll find the tenant from the tenants list
      const response = await ownerDataService.getOwnerTenants();
      const foundTenant = response.data.find(t => t.id === parseInt(id));
      setTenant(foundTenant);
    } catch (err) {
      console.error('Error loading tenant details:', err);
      setError('Failed to load tenant details. Please try again.');
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
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'lease', label: 'Lease Details' },
    { id: 'payments', label: 'Payment History' },
    { id: 'communications', label: 'Communications' }
  ];

  // Mock payment history
  const paymentHistory = [
    { date: '2024-02-01', amount: tenant?.monthly_rent || 0, status: 'paid', method: 'Bank Transfer' },
    { date: '2024-01-01', amount: tenant?.monthly_rent || 0, status: 'paid', method: 'Bank Transfer' },
    { date: '2023-12-01', amount: tenant?.monthly_rent || 0, status: 'paid', method: 'Cash' },
    { date: '2023-11-01', amount: tenant?.monthly_rent || 0, status: 'paid', method: 'Bank Transfer' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested tenant could not be found.'}</p>
          <Link to="/owner/tenants">
            <Button variant="primary">Back to Tenants</Button>
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
            <Link to="/owner/tenants" className="hover:text-teal-600">Tenants</Link>
            <span>/</span>
            <span>{tenant.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-700">
                {tenant.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-gray-600">{tenant.email}</p>
              <p className="text-gray-600">{tenant.phone}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(tenant.payment_status)}`}>
            {tenant.payment_status?.charAt(0).toUpperCase() + tenant.payment_status?.slice(1)}
          </span>
          <Button variant="primary">Contact Tenant</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-teal-600">
            SAR {tenant.monthly_rent?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Monthly Rent</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            SAR {tenant.deposit?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Security Deposit</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.ceil((new Date(tenant.lease_end) - new Date()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-sm text-gray-500">Days Until Lease End</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {paymentHistory.filter(p => p.status === 'paid').length}
          </div>
          <div className="text-sm text-gray-500">Payments Made</div>
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
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header="Personal Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{tenant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{tenant.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{tenant.phone}</p>
              </div>
            </div>
          </Card>

          <Card header="Property Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Property</label>
                <p className="text-gray-900">{tenant.property_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unit Number</label>
                <p className="text-gray-900">{tenant.unit_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Move-in Date</label>
                <p className="text-gray-900">{formatDate(tenant.lease_start)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'lease' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header="Lease Terms">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-gray-900">{formatDate(tenant.lease_start)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-gray-900">{formatDate(tenant.lease_end)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                  <p className="text-gray-900 font-semibold">SAR {tenant.monthly_rent?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                  <p className="text-gray-900 font-semibold">SAR {tenant.deposit?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card header="Lease Status">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(tenant.payment_status)}`}>
                  {tenant.payment_status?.charAt(0).toUpperCase() + tenant.payment_status?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Payment</span>
                <span className="text-gray-900">{formatDate(tenant.last_payment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next Payment Due</span>
                <span className="text-gray-900">{formatDate(tenant.next_payment)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <Card header="Payment History">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      SAR {payment.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'communications' && (
        <Card header="Communication History">
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">Communication history will be displayed here</p>
            <Button variant="primary" className="mt-4">Send Message</Button>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Generate Invoice</Button>
        <Button variant="secondary">Send Payment Reminder</Button>
        <Button variant="secondary">Schedule Inspection</Button>
        <Button variant="ghost">Export Tenant Data</Button>
      </div>
    </div>
  );
};

export default OwnerTenantDetails;
