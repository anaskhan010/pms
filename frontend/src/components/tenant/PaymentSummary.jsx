import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';

const PaymentSummary = ({ data, loading = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'current':
        return 'text-emerald-600 bg-emerald-50';
      case 'due_soon':
        return 'text-amber-600 bg-amber-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'current':
        return 'All Paid';
      case 'due_soon':
        return 'Due Soon';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  const getDaysUntilDue = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card header="Payment Summary">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card header="Payment Summary">
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-500">No payment information available</p>
        </div>
      </Card>
    );
  }

  const daysUntilDue = getDaysUntilDue(data.next_payment_due);
  const paymentStatus = daysUntilDue < 0 ? 'overdue' : daysUntilDue <= 7 ? 'due_soon' : 'current';

  return (
    <Card 
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
          <Link to="/tenant/payments">
            <Button variant="secondary" size="sm">
              View All →
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Next Payment Due */}
        <div className={`p-4 rounded-lg border ${getPaymentStatusColor(paymentStatus)}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">Next Payment</h4>
              <p className="text-sm text-gray-600">
                Due: {formatDate(data.next_payment_due)}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(paymentStatus)}`}>
              {getPaymentStatusText(paymentStatus)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">
              SAR {data.next_payment_amount?.toLocaleString()}
            </span>
            <div className="text-right">
              {daysUntilDue >= 0 ? (
                <p className="text-sm text-gray-600">
                  {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  {Math.abs(daysUntilDue)} days overdue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-600">
              SAR {data.total_paid_this_year?.toLocaleString()}
            </div>
            <div className="text-gray-600">Paid This Year</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {new Date().getMonth() + 1}
            </div>
            <div className="text-gray-600">Payments Made</div>
          </div>
        </div>

        {/* Payment History Preview */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Payments</h5>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-900">February 2024</p>
                <p className="text-xs text-gray-500">Rent payment</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">SAR 2,400</p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-900">January 2024</p>
                <p className="text-xs text-gray-500">Rent payment</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">SAR 2,400</p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Link to="/tenant/payments">
            <Button 
              variant={paymentStatus === 'overdue' ? 'primary' : 'secondary'} 
              fullWidth
            >
              {paymentStatus === 'overdue' ? 'Pay Now' : 'Make Payment'}
            </Button>
          </Link>
          <Link to="/tenant/payments">
            <Button variant="ghost" fullWidth>
              View Payment History
            </Button>
          </Link>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h6 className="text-xs font-medium text-gray-700 mb-2">Accepted Payment Methods</h6>
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Bank Transfer</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>Cash</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 1v16.24a2 2 0 01-1.85 1.995l-.15.005H5a2 2 0 01-2-2V3a2 2 0 012-2h2a2 2 0 012 2v14h8a2 2 0 002-2V5a2 2 0 00-2-2H9z" />
              </svg>
              <span>Cheque</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PaymentSummary;
