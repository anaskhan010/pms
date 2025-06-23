import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';

const FinancialSummary = ({ financial, loading = false }) => {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const financialItems = [
    {
      label: 'Monthly Income',
      value: financial?.monthly_income || 0,
      format: 'currency',
      icon: 'income',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Yearly Income',
      value: financial?.yearly_income || 0,
      format: 'currency',
      icon: 'yearly',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Outstanding Payments',
      value: financial?.outstanding_payments || 0,
      format: 'currency',
      icon: 'warning',
      color: financial?.outstanding_payments > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgColor: financial?.outstanding_payments > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      urgent: financial?.outstanding_payments > 0
    },
    {
      label: 'Occupancy Rate',
      value: financial?.occupancy_rate || 0,
      format: 'percentage',
      icon: 'occupancy',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return `SAR ${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const renderIcon = (iconType, color) => {
    const iconProps = {
      className: `h-5 w-5 ${color}`,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    };

    switch (iconType) {
      case 'income':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'yearly':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'warning':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'occupancy':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  return (
    <Card 
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Financial Summary</h3>
          <Link to="/owner/financial">
            <Button variant="secondary" size="sm">
              View Details →
            </Button>
          </Link>
        </div>
      }
      className="h-fit"
    >
      <div className="space-y-6">
        {/* Current Month Header */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {currentMonth}
          </h4>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              formatValue(financial?.monthly_income || 0, 'currency')
            )}
          </div>
          <p className="text-sm text-gray-500">Total Monthly Income</p>
        </div>

        {/* Financial Metrics */}
        <div className="space-y-4">
          {financialItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${item.bgColor} ${
                item.urgent ? 'ring-2 ring-amber-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white ${item.urgent ? 'animate-pulse' : ''}`}>
                  {loading ? (
                    <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                  ) : (
                    renderIcon(item.icon, item.color)
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  {item.urgent && (
                    <p className="text-xs text-amber-600">Requires attention</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {loading ? (
                  <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
                ) : (
                  <span className={`font-semibold ${item.color}`}>
                    {formatValue(item.value, item.format)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h5>
          <div className="space-y-2">
            <Link
              to="/owner/billing"
              className="flex items-center justify-between p-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <span>Generate Billing Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/owner/payments"
              className="flex items-center justify-between p-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <span>Track Payments</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            {financial?.outstanding_payments > 0 && (
              <Link
                to="/owner/overdue"
                className="flex items-center justify-between p-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <span>View Overdue Payments</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Performance Indicator */}
        {!loading && financial && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Portfolio Performance</span>
              <div className="flex items-center">
                <span className="text-emerald-600 font-medium">+8.2%</span>
                <svg className="w-4 h-4 text-emerald-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last quarter</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FinancialSummary;
