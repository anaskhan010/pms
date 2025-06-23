import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../common';
import { useAuth } from '../../contexts/AuthContext';
import { tenantDataService } from '../../services/tenantDataService';

const TenantDocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getTenantDocuments(user?.id);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'ejari_certificate':
        return (
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'lease_agreement':
        return (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'security_deposit_receipt':
        return (
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status, expiryDate) => {
    if (status === 'expired') return 'bg-red-100 text-red-800';
    if (expiryDate) {
      const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30) return 'bg-amber-100 text-amber-800';
    }
    return 'bg-emerald-100 text-emerald-800';
  };

  const getStatusText = (status, expiryDate) => {
    if (status === 'expired') return 'Expired';
    if (expiryDate) {
      const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days`;
    }
    return 'Active';
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const documentsByType = {
    ejari_certificate: filteredDocuments.filter(d => d.document_type === 'ejari_certificate'),
    lease_agreement: filteredDocuments.filter(d => d.document_type === 'lease_agreement'),
    receipts: filteredDocuments.filter(d => d.document_type === 'security_deposit_receipt'),
    other: filteredDocuments.filter(d => !['ejari_certificate', 'lease_agreement', 'security_deposit_receipt'].includes(d.document_type))
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadDocuments} variant="primary">
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
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="mt-2 text-gray-600">
            Access and manage your lease documents, certificates, and receipts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadDocuments}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </Card>

      {/* Document Categories */}
      <div className="space-y-8">
        {/* Ejari Certificates */}
        <Card header="Ejari Certificates">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : documentsByType.ejari_certificate.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsByType.ejari_certificate.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h4>
                      <p className="text-sm text-gray-500">{doc.file_size}</p>
                      <p className="text-xs text-gray-400">Uploaded: {formatDate(doc.upload_date)}</p>
                      {doc.expiry_date && (
                        <p className="text-xs text-gray-400">Expires: {formatDate(doc.expiry_date)}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status, doc.expiry_date)}`}>
                        {getStatusText(doc.status, doc.expiry_date)}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-gray-500">No Ejari certificates found</p>
            </div>
          )}
        </Card>

        {/* Lease Agreements */}
        <Card header="Lease Agreements">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : documentsByType.lease_agreement.length > 0 ? (
            <div className="space-y-4">
              {documentsByType.lease_agreement.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h4>
                      <p className="text-sm text-gray-500">{doc.file_size}</p>
                      <p className="text-xs text-gray-400">Uploaded: {formatDate(doc.upload_date)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No lease agreements found</p>
            </div>
          )}
        </Card>

        {/* Receipts */}
        <Card header="Receipts & Payments">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : documentsByType.receipts.length > 0 ? (
            <div className="space-y-4">
              {documentsByType.receipts.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h4>
                      <p className="text-sm text-gray-500">{doc.file_size}</p>
                      <p className="text-xs text-gray-400">Uploaded: {formatDate(doc.upload_date)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No receipts found</p>
            </div>
          )}
        </Card>
      </div>

      {/* Document Actions */}
      <Card header="Document Services">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-emerald-50 rounded-lg">
            <div className="mx-auto h-12 w-12 text-emerald-600 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ejari Renewal</h3>
            <p className="text-sm text-gray-600 mb-4">Renew your Ejari certificate online</p>
            <Button variant="primary" size="sm">
              Renew Ejari
            </Button>
          </div>

          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Download All</h3>
            <p className="text-sm text-gray-600 mb-4">Download all documents as ZIP</p>
            <Button variant="secondary" size="sm">
              Download ZIP
            </Button>
          </div>

          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="mx-auto h-12 w-12 text-purple-600 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Share Documents</h3>
            <p className="text-sm text-gray-600 mb-4">Share with authorized parties</p>
            <Button variant="ghost" size="sm">
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TenantDocumentsPage;
