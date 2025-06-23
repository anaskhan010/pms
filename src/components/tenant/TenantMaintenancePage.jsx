import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Select, Input } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { tenantDataService } from '../../services/tenantDataService';

const TenantMaintenancePage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    issue_type: '',
    title: '',
    description: '',
    priority: 'medium',
    tenant_available: 'weekdays_morning'
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getMaintenanceRequests(user?.id);
      setRequests(response.data || []);
    } catch (err) {
      console.error('Error loading maintenance requests:', err);
      setError('Failed to load maintenance requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await tenantDataService.submitMaintenanceRequest(user?.id, {
        ...newRequest,
        property_id: 1 // Assuming single property for now
      });
      
      if (response.success) {
        setRequests([response.data, ...requests]);
        setNewRequest({
          issue_type: '',
          title: '',
          description: '',
          priority: 'medium',
          tenant_available: 'weekdays_morning'
        });
        setShowNewRequestForm(false);
      }
    } catch (err) {
      console.error('Error submitting request:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Issue',
      render: (_, request) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{request.title}</div>
          <div className="text-sm text-gray-500 capitalize">{request.issue_type}</div>
        </div>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (_, request) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
          {request.priority?.charAt(0).toUpperCase() + request.priority?.slice(1)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, request) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
          {request.status?.replace('_', ' ').charAt(0).toUpperCase() + request.status?.replace('_', ' ').slice(1)}
        </span>
      )
    },
    {
      key: 'submitted_date',
      title: 'Submitted',
      render: (_, request) => (
        <div className="text-sm text-gray-900">{formatDate(request.submitted_date)}</div>
      )
    },
    {
      key: 'assigned_vendor',
      title: 'Assigned To',
      render: (_, request) => (
        <div className="text-sm text-gray-900">{request.assigned_vendor || 'Not assigned'}</div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, request) => (
        <div className="flex space-x-2">
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            View
          </button>
          {request.status === 'completed' && !request.tenant_rating && (
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Rate
            </button>
          )}
        </div>
      )
    }
  ];

  const activeRequests = requests.filter(r => r.status !== 'completed').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Maintenance Requests</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadRequests} variant="primary">
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
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="mt-2 text-gray-600">
            Submit and track maintenance requests for your property
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadRequests}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowNewRequestForm(true)}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              activeRequests
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Active Requests</div>
          <div className="text-xs text-blue-600 mt-1">In progress</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              completedRequests
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
          <div className="text-xs text-emerald-600 mt-1">This year</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-3xl font-bold text-amber-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              requests.filter(r => r.status === 'pending').length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pending</div>
          <div className="text-xs text-amber-600 mt-1">Awaiting assignment</div>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              requests.length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Requests</div>
          <div className="text-xs text-purple-600 mt-1">All time</div>
        </Card>
      </div>

      {/* New Request Form Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Submit Maintenance Request</h3>
              <button
                onClick={() => setShowNewRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Issue Type"
                  value={newRequest.issue_type}
                  onChange={(e) => setNewRequest({...newRequest, issue_type: e.target.value})}
                  options={[
                    { value: '', label: 'Select issue type' },
                    { value: 'plumbing', label: 'Plumbing' },
                    { value: 'electrical', label: 'Electrical' },
                    { value: 'hvac', label: 'HVAC/Air Conditioning' },
                    { value: 'appliances', label: 'Appliances' },
                    { value: 'structural', label: 'Structural' },
                    { value: 'other', label: 'Other' }
                  ]}
                  required
                />
                
                <Select
                  label="Priority"
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                />
              </div>

              <Input
                label="Issue Title"
                value={newRequest.title}
                onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                placeholder="Brief description of the issue"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Please provide detailed information about the issue..."
                  required
                />
              </div>

              <Select
                label="Preferred Time for Access"
                value={newRequest.tenant_available}
                onChange={(e) => setNewRequest({...newRequest, tenant_available: e.target.value})}
                options={[
                  { value: 'weekdays_morning', label: 'Weekdays Morning (8AM-12PM)' },
                  { value: 'weekdays_afternoon', label: 'Weekdays Afternoon (12PM-5PM)' },
                  { value: 'weekdays_evening', label: 'Weekdays Evening (5PM-8PM)' },
                  { value: 'weekends', label: 'Weekends' },
                  { value: 'anytime', label: 'Anytime' }
                ]}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewRequestForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Requests Table */}
      <Card header={`Maintenance Requests (${requests.length})`}>
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="No maintenance requests found"
          variant="default"
        />
      </Card>

      {/* Emergency Contact */}
      <Card header="Emergency Maintenance">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900">Emergency Situations</h3>
              <p className="text-sm text-red-700 mt-1">
                For urgent issues like water leaks, electrical hazards, or security concerns, contact the emergency hotline immediately.
              </p>
              <div className="mt-3">
                <a 
                  href="tel:+971800123456" 
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Emergency Hotline: +971 800 123 456
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Maintenance Tips */}
      <Card header="Maintenance Tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Before Submitting a Request</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Check if the issue is covered by your lease agreement</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Try basic troubleshooting steps first</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Take photos of the issue if possible</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Provide detailed description of the problem</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Response Times</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm font-medium text-red-800">High Priority</span>
                <span className="text-sm text-red-600">24 hours</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                <span className="text-sm font-medium text-amber-800">Medium Priority</span>
                <span className="text-sm text-amber-600">3-5 days</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm font-medium text-green-800">Low Priority</span>
                <span className="text-sm text-green-600">1-2 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TenantMaintenancePage;
