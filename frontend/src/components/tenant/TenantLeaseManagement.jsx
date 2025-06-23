import React, { useState, useEffect } from 'react';
import { Card, Button } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { tenantDataService } from '../../services/tenantDataService';

const TenantLeaseManagement = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadLeases();
  }, []);

  const loadLeases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getLeaseAgreements(user?.id);
      setLeases(response.data || []);
    } catch (err) {
      console.error('Error loading leases:', err);
      setError('Failed to load lease information. Please try again.');
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

  const currentLease = leases.find(lease => lease.status === 'active');
  const remainingDays = currentLease ? Math.ceil((new Date(currentLease.lease_end) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  const tabs = [
    { id: 'current', label: 'Current Lease' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'renewal', label: 'Renewal Options' }
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Lease Information</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadLeases} variant="primary">
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
          <h1 className="text-3xl font-bold text-gray-900">Lease Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your lease agreements, terms, and renewal options
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadLeases}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">
            Download Agreement
          </Button>
        </div>
      </div>

      {/* Lease Status Alert */}
      {!loading && currentLease && remainingDays <= 90 && (
        <div className={`p-4 rounded-lg border ${
          remainingDays <= 30 
            ? 'bg-red-50 border-red-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className={`w-5 h-5 mt-0.5 ${
                remainingDays <= 30 ? 'text-red-600' : 'text-amber-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${
                remainingDays <= 30 ? 'text-red-900' : 'text-amber-900'
              }`}>
                {remainingDays <= 30 ? 'Urgent: Lease Renewal Required' : 'Lease Renewal Reminder'}
              </h3>
              <p className={`text-sm mt-1 ${
                remainingDays <= 30 ? 'text-red-700' : 'text-amber-700'
              }`}>
                Your lease expires in {remainingDays} days ({formatDate(currentLease.lease_end)}). 
                Please contact your landlord to discuss renewal options.
              </p>
            </div>
            <Button variant="primary" size="sm">
              Discuss Renewal
            </Button>
          </div>
        </div>
      )}

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
      {activeTab === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <>
              <Card loading={true} className="h-64" />
              <Card loading={true} className="h-64" />
            </>
          ) : currentLease ? (
            <>
              {/* Lease Overview */}
              <Card header="Lease Overview">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-gray-900 font-medium">{formatDate(currentLease.lease_start)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <p className="text-gray-900 font-medium">{formatDate(currentLease.lease_end)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                      <p className="text-teal-600 font-semibold text-lg">
                        SAR {currentLease.monthly_rent?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                      <p className="text-gray-900 font-medium">
                        SAR {currentLease.security_deposit?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contract Type</label>
                      <p className="text-gray-900 font-medium capitalize">{currentLease.contract_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Auto Renewal</label>
                      <p className={`font-medium ${currentLease.auto_renewal ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {currentLease.auto_renewal ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Terms */}
              <Card header="Payment Terms">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Due Date</label>
                      <p className="text-gray-900 font-medium">
                        {currentLease.payment_due_date}{currentLease.payment_due_date === 1 ? 'st' : currentLease.payment_due_date === 2 ? 'nd' : currentLease.payment_due_date === 3 ? 'rd' : 'th'} of each month
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Late Fee</label>
                      <p className="text-gray-900 font-medium">{currentLease.late_fee_percentage}% per month</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Notice Period</label>
                      <p className="text-gray-900 font-medium">{currentLease.notice_period_days} days</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Commission</label>
                      <p className="text-gray-900 font-medium">SAR {currentLease.commission}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Next Payment Due</h4>
                    <p className="text-blue-700">March 1, 2024 - SAR {currentLease.monthly_rent?.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="col-span-2 text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Lease Found</h3>
              <p className="text-gray-500">No lease agreement information available.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'terms' && (
        <Card header="Terms & Conditions">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          ) : currentLease?.terms_and_conditions ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Please review the following terms and conditions of your lease agreement:
              </p>
              <ul className="space-y-3">
                {currentLease.terms_and_conditions.map((term, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-teal-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{term}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  For questions about these terms, please contact your property manager or landlord.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No terms and conditions available.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'renewal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <>
              <Card loading={true} className="h-64" />
              <Card loading={true} className="h-64" />
            </>
          ) : currentLease?.renewal_options?.available ? (
            <>
              <Card header="Renewal Options">
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-900 mb-2">Early Renewal Discount</h4>
                    <p className="text-emerald-700 text-sm mb-3">
                      Renew your lease early and save {currentLease.renewal_options.early_renewal_discount}% on your monthly rent!
                    </p>
                    <div className="text-sm">
                      <p><strong>Current Rent:</strong> SAR {currentLease.monthly_rent?.toLocaleString()}/month</p>
                      <p><strong>Discounted Rent:</strong> SAR {Math.round(currentLease.monthly_rent * (1 - currentLease.renewal_options.early_renewal_discount / 100))?.toLocaleString()}/month</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Renewal Deadline</label>
                    <p className="text-gray-900 font-medium">{formatDate(currentLease.renewal_options.renewal_deadline)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Projected Rent Increase</label>
                    <p className="text-gray-900 font-medium">{currentLease.rent_increase_percentage}% annually</p>
                  </div>
                </div>
              </Card>

              <Card header="Renewal Process">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">1</span>
                      </div>
                      <p className="text-gray-700">Contact your landlord to express interest</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">2</span>
                      </div>
                      <p className="text-gray-700">Negotiate terms and rental amount</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">3</span>
                      </div>
                      <p className="text-gray-700">Sign new lease agreement</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">4</span>
                      </div>
                      <p className="text-gray-700">Update Ejari registration</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="primary" fullWidth>
                      Start Renewal Process
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="col-span-2 text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Renewal Options Available</h3>
              <p className="text-gray-500">Contact your landlord for renewal information.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantLeaseManagement;
