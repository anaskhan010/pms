import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner, Alert } from '../common';
import { adminApiService } from '../../services/adminApiService';

// Helper function for formatting dates (used in tab components)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const TenantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ejariInfo, setEjariInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingEjari, setLoadingEjari] = useState(false);

  useEffect(() => {
    loadTenantDetails();
  }, [id]);

  const loadTenantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApiService.getTenant(id);
      if (response.success) {
        setTenant(response.data);
      } else {
        setError(response.error || 'Failed to load tenant details');
      }
    } catch (err) {
      console.error('Error loading tenant details:', err);
      setError('An unexpected error occurred while loading tenant details');
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      setLoadingContracts(true);
      const response = await adminApiService.getTenantContracts(id);
      if (response.success) {
        setContracts(response.data);
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await adminApiService.getTenantPayments(id);
      if (response.success) {
        setPayments(response.data);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadEjariInfo = async () => {
    try {
      setLoadingEjari(true);
      // For now, we'll extract Ejari info from tenant notes or create a dedicated API later
      if (tenant && tenant.notes) {
        // Try to parse Ejari info from notes
        const ejariMatch = tenant.notes.match(/Ejari Number: ([^,]+)/);
        const ejariExpiryMatch = tenant.notes.match(/Ejari Expiry: ([^,]+)/);

        setEjariInfo({
          ejari_number: ejariMatch ? ejariMatch[1] : null,
          ejari_expiry: ejariExpiryMatch ? ejariExpiryMatch[1] : null,
          ejari_document_url: tenant.ejari_document_url || null,
          status: 'active' // Default status
        });
      }
    } catch (err) {
      console.error('Error loading Ejari info:', err);
    } finally {
      setLoadingEjari(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Load data for the selected tab if not already loaded
    if (tab === 'contracts' && contracts.length === 0) {
      loadContracts();
    } else if (tab === 'payments' && payments.length === 0) {
      loadPayments();
    } else if (tab === 'ejari' && !ejariInfo) {
      loadEjariInfo();
    }
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="warning" className="mb-6">
          Tenant not found
        </Alert>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'contracts', name: 'Contracts', icon: '📄' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'ejari', name: 'Ejari Information', icon: '🏠' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Professional Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden">
                    {tenant.image ? (
                      <img
                        src={`${import.meta.env.VITE_APP_IMAGE_URL}${tenant.image}`}
                        alt={`${tenant.firstName} ${tenant.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl font-bold text-slate-700 ${tenant.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                      {tenant.firstName?.charAt(0)?.toUpperCase()}{tenant.lastName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  {/* Status Indicator */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    tenant.status === 'Active' ? 'bg-teal-500' : 'bg-red-500'
                  }`} />
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-white">
                    {tenant.firstName} {tenant.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-300">
                      ID: {tenant.tenantId}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">
                      {tenant.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.status === 'Active'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status}
                    </span>
                    <span className="text-slate-400 text-xs">
                      Member since {formatDate(tenant.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => navigate(-1)}
                  variant="secondary"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Button>
                <Button
                  onClick={() => {/* Handle edit */}}
                  variant="primary"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Tenant
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 shadow-sm">
          <nav className="flex border-b border-slate-200">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white border-b-2 border-teal-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${index !== tabs.length - 1 ? 'border-r border-slate-200' : ''}`}
              >
                <span className="text-lg">
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab tenant={tenant} />
        )}
        
        {activeTab === 'contracts' && (
          <ContractsTab
            contracts={contracts}
            loading={loadingContracts}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab
            payments={payments}
            loading={loadingPayments}
          />
        )}
        
        {activeTab === 'ejari' && (
          <EjariTab
            ejariInfo={ejariInfo}
            loading={loadingEjari}
            tenant={tenant}
          />
        )}
      </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ tenant }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Personal Information */}
    <div className="lg:col-span-2">
      <Card className="bg-white border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200">
                {tenant.firstName} {tenant.lastName}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center">
                <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {tenant.email}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</label>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center">
                <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {tenant.phoneNumber || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Nationality</label>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200">
                {tenant.nationality || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Date of Birth</label>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center">
                <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {tenant.dateOfBirth ? formatDate(tenant.dateOfBirth) : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</label>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 capitalize">
                {tenant.gender || 'N/A'}
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Address</label>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center">
                <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {tenant.address || 'N/A'}
              </p>
            </div>
          </div>

          {/* Additional Tenant Information */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-md font-semibold text-slate-900 mb-4">Registration & Professional Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Registration Number</label>
                <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200">
                  {tenant.registrationNumber || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Registration Expiry</label>
                <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center">
                  <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {tenant.registrationExpiry ? formatDate(tenant.registrationExpiry) : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Occupation</label>
                <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200">
                  {tenant.occupation || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Ejari Document</label>
                <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center">
                  <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {tenant.ejariPdfPath ? 'Available' : 'Not uploaded'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Quick Stats & Actions */}
    <div className="space-y-6">
      <Card className="bg-white border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Quick Stats</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tenant.status === 'Active'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {tenant.status}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Tenant ID</span>
              <span className="text-sm font-medium text-slate-900">{tenant.tenantId}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Created</span>
              <span className="text-sm text-slate-900">{formatDate(tenant.created_at)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Last Updated</span>
              <span className="text-sm text-slate-900">{formatDate(tenant.updated_at)}</span>
            </div>

            {/* Apartment Information */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Apartment Status</span>
              <span className={`text-sm font-medium ${
                tenant.buildingName ? 'text-teal-600' : 'text-slate-500'
              }`}>
                {tenant.buildingName ? 'Assigned' : 'Not Assigned'}
              </span>
            </div>

            {tenant.buildingName && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Building</span>
                <span className="text-sm font-medium text-slate-900">{tenant.buildingName}</span>
              </div>
            )}

            {tenant.floorName && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Floor</span>
                <span className="text-sm text-slate-900">{tenant.floorName}</span>
              </div>
            )}

            {tenant.rentPrice && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Monthly Rent</span>
                <span className="text-sm font-medium text-slate-900">SAR {tenant.rentPrice?.toLocaleString()}</span>
              </div>
            )}

            {tenant.contractId ? (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Contract Period</span>
                <span className="text-sm text-slate-900">
                  {tenant.startDate && tenant.endDate
                    ? `${formatDate(tenant.startDate)} - ${formatDate(tenant.endDate)}`
                    : 'N/A'
                  }
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Contract Status</span>
                <span className="text-sm text-slate-500">No Contract</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Apartment Details */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                tenant.apartmentId || tenant.buildingName
                  ? 'bg-teal-100'
                  : 'bg-slate-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  tenant.apartmentId || tenant.buildingName
                    ? 'text-teal-600'
                    : 'text-slate-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Current Apartment</h3>
            </div>
            {!(tenant.apartmentId || tenant.buildingName) && (
              <button className="px-3 py-1 bg-teal-600 text-white text-xs rounded-md hover:bg-teal-700 transition-colors">
                Assign Apartment
              </button>
            )}
          </div>

          {tenant.apartmentId || tenant.buildingName ? (
            <div className="space-y-3">
              {tenant.buildingName && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Building</label>
                  <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                    {tenant.buildingName}
                  </p>
                </div>
              )}
              {tenant.buildingAddress && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Address</label>
                  <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                    {tenant.buildingAddress}
                  </p>
                </div>
              )}
              {tenant.floorName && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Floor</label>
                  <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                    {tenant.floorName}
                  </p>
                </div>
              )}
              {(tenant.bedrooms || tenant.bathrooms) && (
                <div className="grid grid-cols-2 gap-3">
                  {tenant.bedrooms && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Bedrooms</label>
                      <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                        {tenant.bedrooms}
                      </p>
                    </div>
                  )}
                  {tenant.bathrooms && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Bathrooms</label>
                      <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                        {tenant.bathrooms}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">No Apartment Assigned</h4>
              <p className="text-slate-500 mb-4">This tenant is not currently assigned to any apartment.</p>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Assign Apartment
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  </div>
);

// Contracts Tab Component
const ContractsTab = ({ contracts, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Contracts</h3>
          </div>
          <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700">
            + New Contract
          </Button>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">No contracts found</h4>
            <p className="text-slate-500">This tenant doesn't have any contracts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contract ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {contract.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {contract.property_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(contract.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(contract.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contract.status === 'active'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="secondary" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

// Payments Tab Component
const PaymentsTab = ({ payments, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Payment History</h3>
          </div>
          <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700">
            + Record Payment
          </Button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">No payments found</h4>
            <p className="text-slate-500">This tenant doesn't have any payment records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      SAR {payment.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {payment.payment_method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-teal-100 text-teal-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="secondary" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

// Ejari Information Tab Component
const EjariTab = ({ ejariInfo, loading, tenant }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Extract Ejari info from tenant notes if available
  const extractEjariFromNotes = (notes) => {
    if (!notes) return null;

    const ejariNumberMatch = notes.match(/Registration Number: ([^,\n]+)/i);
    const ejariExpiryMatch = notes.match(/Registration Expiry: ([^,\n]+)/i);
    const monthlyRentMatch = notes.match(/Monthly Rent: ([^,\n]+)/i);
    const buildingMatch = notes.match(/Building: ([^,\n]+)/i);
    const apartmentMatch = notes.match(/Apartment: ([^,\n]+)/i);

    return {
      ejari_number: ejariNumberMatch ? ejariNumberMatch[1].trim() : null,
      ejari_expiry: ejariExpiryMatch ? ejariExpiryMatch[1].trim() : null,
      monthly_rent: monthlyRentMatch ? monthlyRentMatch[1].trim() : null,
      building: buildingMatch ? buildingMatch[1].trim() : null,
      apartment: apartmentMatch ? apartmentMatch[1].trim() : null,
    };
  };

  const ejariData = ejariInfo || extractEjariFromNotes(tenant?.notes);

  return (
    <div className="space-y-6">
      {/* Ejari Document Card */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Ejari Information</h3>
            </div>
            <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Update Ejari
            </Button>
          </div>

          {!ejariData || (!ejariData.ejari_number && !ejariData.building) ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">No Ejari Information</h4>
              <p className="text-slate-500 mb-6">This tenant doesn't have Ejari information uploaded yet.</p>
              <Button variant="primary" className="bg-teal-600 hover:bg-teal-700">
                Upload Ejari Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ejari Details */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Registration Details</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Ejari Number
                      </label>
                      <p className="text-sm font-medium text-slate-900 bg-white p-3 rounded border border-slate-200">
                        {ejariData.ejari_number || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Expiry Date
                      </label>
                      <p className="text-sm text-slate-900 bg-white p-3 rounded border border-slate-200 flex items-center">
                        <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {ejariData.ejari_expiry || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Status
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Property Details</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Building
                      </label>
                      <p className="text-sm text-slate-900 bg-white p-3 rounded border border-slate-200">
                        {ejariData.building || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Apartment
                      </label>
                      <p className="text-sm text-slate-900 bg-white p-3 rounded border border-slate-200">
                        {ejariData.apartment || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Monthly Rent
                      </label>
                      <p className="text-sm font-medium text-slate-900 bg-white p-3 rounded border border-slate-200">
                        {ejariData.monthly_rent || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Document Preview</h4>
                  </div>

                  {tenant?.ejari_document_url ? (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Ejari Document</p>
                      <p className="text-xs text-slate-500 mb-4">Click to view full document</p>
                      <Button variant="secondary" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        View Document
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">No Document Uploaded</p>
                      <p className="text-xs text-slate-500 mb-4">Upload the Ejari document for this tenant</p>
                      <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700">
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Quick Actions</h4>
                  </div>

                  <div className="space-y-2">
                    <Button variant="secondary" className="w-full justify-start text-sm border-slate-300 text-slate-700 hover:bg-white">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Ejari Copy
                    </Button>
                    <Button variant="secondary" className="w-full justify-start text-sm border-slate-300 text-slate-700 hover:bg-white">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Information
                    </Button>
                    <Button variant="secondary" className="w-full justify-start text-sm border-slate-300 text-slate-700 hover:bg-white">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Renew Ejari
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantDetailsPage;
