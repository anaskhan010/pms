import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';

const LeaseOverview = ({ data, loading = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRemainingTimeColor = (days) => {
    if (days <= 30) return 'text-red-600';
    if (days <= 90) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getRemainingTimeStatus = (days) => {
    if (days <= 30) return 'Urgent renewal required';
    if (days <= 90) return 'Renewal recommended';
    return 'Lease active';
  };

  if (loading) {
    return (
      <Card header="Lease Information">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card header="Lease Information">
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No lease information available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Lease Information</h3>
          <Link to="/tenant/lease">
            <Button variant="secondary" size="sm">
              Manage Lease →
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Lease Period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Lease Start</label>
            <p className="text-gray-900 font-medium">{formatDate(data.lease_start)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Lease End</label>
            <p className="text-gray-900 font-medium">{formatDate(data.lease_end)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
            <p className="text-teal-600 font-semibold text-lg">
              SAR {data.monthly_rent?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Remaining Time Visualization */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Time Remaining</span>
            <span className={`text-sm font-semibold ${getRemainingTimeColor(data.remaining_days)}`}>
              {getRemainingTimeStatus(data.remaining_days)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRemainingTimeColor(data.remaining_days)}`}>
                {data.remaining_months}
              </div>
              <div className="text-xs text-gray-500">Months</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRemainingTimeColor(data.remaining_days)}`}>
                {data.remaining_days}
              </div>
              <div className="text-xs text-gray-500">Days</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                data.remaining_days <= 30 
                  ? 'bg-red-500' 
                  : data.remaining_days <= 90 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.max(5, Math.min(95, (data.remaining_days / 365) * 100))}%`
              }}
            ></div>
          </div>
        </div>

        {/* Lease Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Security Deposit</span>
              <span className="font-medium text-gray-900">
                SAR {data.security_deposit?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Type</span>
              <span className="font-medium text-gray-900 capitalize">
                {data.contract_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auto Renewal</span>
              <span className={`font-medium ${data.auto_renewal ? 'text-emerald-600' : 'text-gray-900'}`}>
                {data.auto_renewal ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Notice Period</span>
              <span className="font-medium text-gray-900">
                {data.notice_period_days} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Due</span>
              <span className="font-medium text-gray-900">
                {data.payment_due_date}{data.payment_due_date === 1 ? 'st' : data.payment_due_date === 2 ? 'nd' : data.payment_due_date === 3 ? 'rd' : 'th'} of month
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late Fee</span>
              <span className="font-medium text-gray-900">
                {data.late_fee_percentage}% per month
              </span>
            </div>
          </div>
        </div>

        {/* Renewal Options */}
        {data.renewal_options?.available && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">Lease Renewal Available</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Early renewal discount: {data.renewal_options.early_renewal_discount}% off
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Deadline: {formatDate(data.renewal_options.renewal_deadline)}
                </p>
              </div>
              <Link to="/tenant/lease">
                <Button variant="primary" size="sm">
                  Renew Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <Link to="/tenant/lease">
            <Button variant="secondary">
              View Full Agreement
            </Button>
          </Link>
          <Link to="/tenant/documents">
            <Button variant="ghost">
              Download Contract
            </Button>
          </Link>
          {data.remaining_days <= 90 && (
            <Link to="/tenant/lease">
              <Button variant="primary">
                Discuss Renewal
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LeaseOverview;
