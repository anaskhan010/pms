import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common';

const OwnerStatsCards = ({ financial, properties, loading = false }) => {
  const stats = [
    {
      title: 'Total Portfolio Value',
      value: financial ? `SAR ${financial.total_portfolio_value?.toLocaleString()}` : 'SAR 0',
      icon: 'portfolio',
      color: 'teal',
      change: '+12.5%',
      changeType: 'increase',
      description: 'vs last quarter'
    },
    {
      title: 'Monthly Income',
      value: financial ? `SAR ${financial.monthly_income?.toLocaleString()}` : 'SAR 0',
      icon: 'income',
      color: 'emerald',
      change: '+8.2%',
      changeType: 'increase',
      description: 'vs last month'
    },
    {
      title: 'Properties',
      value: financial?.properties_count || properties?.length || 0,
      icon: 'building',
      color: 'indigo',
      subValue: `${financial?.total_units || 0} total units`,
      description: 'across all properties'
    },
    {
      title: 'Occupancy Rate',
      value: financial ? `${financial.occupancy_rate?.toFixed(1)}%` : '0%',
      icon: 'occupancy',
      color: 'purple',
      change: '+2.1%',
      changeType: 'increase',
      description: 'vs last month'
    },
    {
      title: 'Outstanding Payments',
      value: financial ? `SAR ${financial.outstanding_payments?.toLocaleString()}` : 'SAR 0',
      icon: 'warning',
      color: financial?.outstanding_payments > 0 ? 'amber' : 'emerald',
      urgent: financial?.outstanding_payments > 0,
      description: 'requires attention'
    }
  ];

  const renderIcon = (iconType, colorClasses) => {
    const iconProps = {
      className: `h-6 w-6 ${colorClasses.text}`,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    };

    switch (iconType) {
      case 'portfolio':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'income':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'building':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'occupancy':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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

  const getColorClasses = (color) => {
    const colorMap = {
      teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-600',
        border: 'border-teal-200',
        accent: 'bg-teal-500'
      },
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        accent: 'bg-emerald-500'
      },
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        accent: 'bg-indigo-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        accent: 'bg-purple-500'
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        accent: 'bg-amber-500'
      }
    };
    return colorMap[color] || colorMap.teal;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <Card
            key={index}
            variant="default"
            className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              stat.urgent ? 'ring-2 ring-amber-200' : ''
            }`}
            loading={loading}
          >
            <div className="relative">
              {/* Accent bar */}
              <div className={`h-1 ${colorClasses.accent} w-full absolute -top-6 left-0 right-0`}></div>
              
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2 truncate">
                    {loading ? (
                      <span className="inline-block h-8 w-20 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                  
                  {/* Sub value or change indicator */}
                  {stat.subValue && !loading && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">{stat.subValue}</span>
                    </div>
                  )}
                  
                  {stat.change && !loading && (
                    <div className="mt-2 flex items-center">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? '↗' : '↘'} {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">{stat.description}</span>
                    </div>
                  )}
                  
                  {!stat.change && !stat.subValue && stat.description && !loading && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">{stat.description}</span>
                    </div>
                  )}
                </div>
                
                {/* Icon */}
                <div className={`${colorClasses.bg} ${colorClasses.border} border p-3 rounded-xl ml-4 flex-shrink-0`}>
                  {loading ? (
                    <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
                  ) : (
                    renderIcon(stat.icon, colorClasses)
                  )}
                </div>
              </div>
              
              {/* Urgent indicator */}
              {stat.urgent && !loading && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default OwnerStatsCards;
