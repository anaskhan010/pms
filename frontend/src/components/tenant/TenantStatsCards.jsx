import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common';

const TenantStatsCards = ({ data, loading = false }) => {
  const LoadingCard = () => (
    <Card className="text-center">
      <div className="animate-pulse">
        <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-1"></div>
        <div className="h-3 w-24 bg-gray-200 rounded mx-auto"></div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Lease Status */}
      <Link to="/tenant/lease">
        <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-teal-50 to-blue-50 cursor-pointer">
          <div className="text-3xl font-bold text-teal-600">
            {data?.lease_renewal_due ? (
              <span className="text-amber-600">Renewal Due</span>
            ) : (
              "Active"
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Lease Status</div>
          <div className="text-xs text-teal-600 mt-1">
            {data?.lease_renewal_due ? "Action required" : "All good"}
          </div>
        </Card>
      </Link>

      {/* Pending Bills */}
      <Link to="/tenant/bills">
        <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-amber-50 to-orange-50 cursor-pointer">
          <div className="text-3xl font-bold text-amber-600">
            {data?.pending_bills_count || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pending Bills</div>
          <div className="text-xs text-amber-600 mt-1">
            {data?.pending_bills_count > 0 ? "Requires payment" : "All paid"}
          </div>
        </Card>
      </Link>

      {/* Active Maintenance */}
      <Link to="/tenant/maintenance">
        <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-50 to-indigo-50 cursor-pointer">
          <div className="text-3xl font-bold text-purple-600">
            {data?.active_requests_count || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">Active Requests</div>
          <div className="text-xs text-purple-600 mt-1">
            {data?.active_requests_count > 0 ? "In progress" : "No issues"}
          </div>
        </Card>
      </Link>

      {/* Properties */}
      <Link to="/tenant/properties">
        <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-emerald-50 to-green-50 cursor-pointer">
          <div className="text-3xl font-bold text-emerald-600">
            {data?.total_properties || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">My Properties</div>
          <div className="text-xs text-emerald-600 mt-1">
            {data?.total_properties === 1 ? "Single unit" : "Multiple units"}
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default TenantStatsCards;
