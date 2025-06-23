import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';

const MaintenanceOverview = ({ maintenance = [], complaints = [], loading = false }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'open':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const allItems = [
    ...maintenance.map(item => ({ ...item, type: 'maintenance' })),
    ...complaints.map(item => ({ ...item, type: 'complaint' }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const recentItems = allItems.slice(0, 5);

  const stats = {
    total_maintenance: maintenance.length,
    pending_maintenance: maintenance.filter(m => m.status === 'pending').length,
    in_progress_maintenance: maintenance.filter(m => m.status === 'in_progress').length,
    total_complaints: complaints.length,
    open_complaints: complaints.filter(c => c.status === 'open').length,
    resolved_complaints: complaints.filter(c => c.status === 'resolved').length
  };

  const LoadingItem = () => (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
    </div>
  );

  return (
    <Card 
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Maintenance & Complaints</h3>
          <Link to="/owner/maintenance">
            <Button variant="secondary" size="sm">
              View All →
            </Button>
          </Link>
        </div>
      }
      className="h-fit"
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Maintenance</p>
              <p className="text-2xl font-bold text-blue-900">
                {loading ? (
                  <div className="h-6 w-8 bg-blue-200 rounded animate-pulse"></div>
                ) : (
                  stats.total_maintenance
                )}
              </p>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          {!loading && (
            <div className="mt-2 text-sm text-blue-600">
              {stats.pending_maintenance} pending, {stats.in_progress_maintenance} in progress
            </div>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Complaints</p>
              <p className="text-2xl font-bold text-purple-900">
                {loading ? (
                  <div className="h-6 w-8 bg-purple-200 rounded animate-pulse"></div>
                ) : (
                  stats.total_complaints
                )}
              </p>
            </div>
            <div className="text-purple-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12V9a4 4 0 118 0m-4 8a4 4 0 01-4-4V9a4 4 0 118 0v3m-4 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              </svg>
            </div>
          </div>
          {!loading && (
            <div className="mt-2 text-sm text-purple-600">
              {stats.open_complaints} open, {stats.resolved_complaints} resolved
            </div>
          )}
        </div>
      </div>

      {/* Recent Items */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
        
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingItem key={index} />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No maintenance requests or complaints</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                  item.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'maintenance' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'maintenance' ? 'Maintenance' : 'Complaint'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority} priority
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                
                <h5 className="font-medium text-gray-900 mb-1">
                  {item.issue || item.subject}
                </h5>
                
                <div className="text-sm text-gray-600 mb-2">
                  <p>{item.property_name} - {item.unit_number}</p>
                  {item.tenant_name && <p>Tenant: {item.tenant_name}</p>}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatDate(item.created_date)}</span>
                  {item.estimated_cost && (
                    <span className="font-medium text-gray-700">
                      Est. Cost: SAR {item.estimated_cost}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!loading && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h5>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/owner/maintenance/new"
              className="flex items-center justify-center p-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Request
            </Link>
            <Link
              to="/owner/maintenance/vendors"
              className="flex items-center justify-center p-3 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manage Vendors
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MaintenanceOverview;
