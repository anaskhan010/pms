import React, { useState } from 'react';
import { adminDashboardService } from '../../services/adminDashboardService';
import { adminApiService } from '../../services/adminApiService';
import { propertyApiService } from '../../services/propertyApiService';

/**
 * Admin Dashboard API Test Component
 * Tests all APIs used by the admin dashboard
 */
const AdminDashboardAPITest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const addResult = (testName, result) => {
    setResults(prev => ({
      ...prev,
      [testName]: result
    }));
  };

  const testTenantStatistics = async () => {
    try {
      setLoading(true);
      const result = await adminApiService.getTenantStatistics();
      addResult('tenantStatistics', {
        success: result.success,
        data: result.data,
        message: result.success ? 'Successfully fetched tenant statistics' : result.error
      });
    } catch (error) {
      addResult('tenantStatistics', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testPropertyStatistics = async () => {
    try {
      setLoading(true);
      const result = await propertyApiService.getOverallPropertyStatistics();
      addResult('propertyStatistics', {
        success: result.success,
        data: result.data,
        message: result.success ? 'Successfully fetched property statistics' : result.error
      });
    } catch (error) {
      addResult('propertyStatistics', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testOccupancyAnalytics = async () => {
    try {
      setLoading(true);
      const result = await propertyApiService.getOccupancyAnalytics();
      addResult('occupancyAnalytics', {
        success: result.success,
        data: result.data,
        message: result.success ? 'Successfully fetched occupancy analytics' : result.error
      });
    } catch (error) {
      addResult('occupancyAnalytics', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testRecentTenants = async () => {
    try {
      setLoading(true);
      const result = await adminApiService.getTenants({
        page: 1, 
        limit: 5, 
        sortBy: 'created_at', 
        sortOrder: 'desc' 
      });
      addResult('recentTenants', {
        success: result.success,
        data: result.data,
        count: result.total,
        message: result.success ? 'Successfully fetched recent tenants' : result.error
      });
    } catch (error) {
      addResult('recentTenants', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testRecentProperties = async () => {
    try {
      setLoading(true);
      const result = await propertyApiService.getProperties({ 
        page: 1, 
        limit: 5, 
        sortBy: 'created_at', 
        sortOrder: 'desc' 
      });
      addResult('recentProperties', {
        success: result.success,
        data: result.data,
        count: result.total,
        message: result.success ? 'Successfully fetched recent properties' : result.error
      });
    } catch (error) {
      addResult('recentProperties', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testDashboardOverview = async () => {
    try {
      setLoading(true);
      const result = await adminDashboardService.getDashboardOverview();
      addResult('dashboardOverview', {
        success: result.success,
        data: result.data,
        message: result.success ? 'Successfully fetched dashboard overview' : result.error
      });
    } catch (error) {
      addResult('dashboardOverview', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testDashboardStats = async () => {
    try {
      setLoading(true);
      const result = await adminDashboardService.getDashboardStats();
      addResult('dashboardStats', {
        success: result.success,
        data: result.data,
        message: result.success ? 'Successfully fetched dashboard stats' : result.error
      });
    } catch (error) {
      addResult('dashboardStats', {
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    await testTenantStatistics();
    await testPropertyStatistics();
    await testOccupancyAnalytics();
    await testRecentTenants();
    await testRecentProperties();
    await testDashboardOverview();
    await testDashboardStats();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard API Test Suite</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testTenantStatistics}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Tenant Stats
          </button>
          
          <button
            onClick={testPropertyStatistics}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Property Stats
          </button>
          
          <button
            onClick={testOccupancyAnalytics}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Occupancy
          </button>
          
          <button
            onClick={testRecentTenants}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test Recent Tenants
          </button>
          
          <button
            onClick={testRecentProperties}
            disabled={loading}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50"
          >
            Test Recent Properties
          </button>
          
          <button
            onClick={testDashboardOverview}
            disabled={loading}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Test Dashboard Overview
          </button>
          
          <button
            onClick={testDashboardStats}
            disabled={loading}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:opacity-50"
          >
            Test Dashboard Stats
          </button>
          
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
          >
            Run All Tests
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Running tests...</p>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(results).map(([testName, result]) => (
            <div
              key={testName}
              className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{testName}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.success ? 'PASS' : 'FAIL'}
                </span>
              </div>
              
              <p className="text-gray-700 mb-2">{result.message}</p>
              
              {result.count !== undefined && (
                <p className="text-sm text-gray-600 mt-1">
                  Total records: {result.count}
                </p>
              )}
              
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View Response Data
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click a test button to start testing the admin dashboard APIs
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardAPITest;
