import React, { useState, useEffect } from 'react';
import { Card, Button, Table } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { tenantDataService } from '../../services/tenantDataService';

const TenantPaymentCenter = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getPaymentHistory(user?.id);
      setPayments(response.data || []);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'payment_date',
      title: 'Date',
      render: (_, payment) => (
        <div className="text-sm text-gray-900">{formatDate(payment.payment_date)}</div>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (_, payment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{payment.description}</div>
          <div className="text-sm text-gray-500 capitalize">{payment.payment_type}</div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (_, payment) => (
        <div className="text-sm font-medium text-gray-900">
          SAR {payment.amount?.toLocaleString()}
          {payment.late_fee > 0 && (
            <div className="text-xs text-red-600">
              +SAR {payment.late_fee} late fee
            </div>
          )}
        </div>
      )
    },
    {
      key: 'method',
      title: 'Method',
      render: (_, payment) => (
        <div className="text-sm text-gray-900 capitalize">
          {payment.method?.replace('_', ' ')}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, payment) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
          {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
        </span>
      )
    },
    {
      key: 'reference',
      title: 'Reference',
      render: (_, payment) => (
        <div className="text-sm text-gray-500">{payment.reference_number}</div>
      )
    }
  ];

  const tabs = [
    { id: 'history', label: 'Payment History' },
    { id: 'upcoming', label: 'Upcoming Payments' },
    { id: 'methods', label: 'Payment Methods' }
  ];

  const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const currentYear = new Date().getFullYear();
  const thisYearPayments = payments.filter(p => new Date(p.payment_date).getFullYear() === currentYear);
  const thisYearTotal = thisYearPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Payment Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadPayments} variant="primary">
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
          <h1 className="text-3xl font-bold text-gray-900">Payment Center</h1>
          <p className="mt-2 text-gray-600">
            Manage your rent payments and view payment history
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadPayments}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">
            Make Payment
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${thisYearTotal.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Paid This Year</div>
          <div className="text-xs text-emerald-600 mt-1">{currentYear}</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              thisYearPayments.length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Payments Made</div>
          <div className="text-xs text-blue-600 mt-1">This year</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-3xl font-bold text-amber-600">
            SAR 2,400
          </div>
          <div className="text-sm text-gray-500 mt-1">Next Payment</div>
          <div className="text-xs text-amber-600 mt-1">Due Mar 1</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalPaid.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Paid</div>
          <div className="text-xs text-purple-600 mt-1">All time</div>
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
      {activeTab === 'history' && (
        <Card header={`Payment History (${payments.length})`}>
          <Table
            columns={columns}
            data={payments}
            loading={loading}
            emptyMessage="No payment history found"
            variant="default"
          />
        </Card>
      )}

      {activeTab === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card header="Next Payment Due">
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-amber-900">March 2024 Rent</h4>
                    <p className="text-sm text-amber-700">Due: March 1, 2024</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                    Due Soon
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-amber-900">SAR 2,400</span>
                  <span className="text-sm text-amber-700">5 days left</span>
                </div>
              </div>
              
              <Button variant="primary" fullWidth>
                Pay Now
              </Button>
            </div>
          </Card>

          <Card header="Payment Schedule">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">April 2024</p>
                  <p className="text-xs text-gray-500">Due: April 1, 2024</p>
                </div>
                <span className="text-sm font-medium text-gray-900">SAR 2,400</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">May 2024</p>
                  <p className="text-xs text-gray-500">Due: May 1, 2024</p>
                </div>
                <span className="text-sm font-medium text-gray-900">SAR 2,400</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">June 2024</p>
                  <p className="text-xs text-gray-500">Due: June 1, 2024</p>
                </div>
                <span className="text-sm font-medium text-gray-900">SAR 2,400</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card header="Available Payment Methods">
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                    <p className="text-sm text-gray-500">Direct transfer to landlord's account</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Recommended</span>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Cash Payment</h4>
                    <p className="text-sm text-gray-500">Pay in person at property office</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Cheque</h4>
                    <p className="text-sm text-gray-500">Post-dated cheques</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card header="Payment Instructions">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Bank Transfer Details</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Bank:</strong> Emirates NBD</p>
                  <p><strong>Account Name:</strong> Al-Rashid Properties</p>
                  <p><strong>Account Number:</strong> 1234567890</p>
                  <p><strong>IBAN:</strong> AE070260001234567890</p>
                  <p><strong>Reference:</strong> Unit A-205 + Your Name</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Payments are due on the 1st of each month</li>
                  <li>• Late payments incur a 2% monthly fee</li>
                  <li>• Always include your unit number in the reference</li>
                  <li>• Keep payment receipts for your records</li>
                </ul>
              </div>

              <div className="pt-4">
                <Button variant="secondary" fullWidth>
                  Download Payment Receipt Template
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TenantPaymentCenter;
