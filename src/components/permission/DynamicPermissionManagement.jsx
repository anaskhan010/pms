import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const DynamicPermissionManagement = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, pagesResponse] = await Promise.all([
        adminApiService.getUserRoles(),
        adminApiService.getPagesWithPermissions()
      ]);

      if (rolesResponse.success) {
        setRoles(rolesResponse.data);
        // Auto-select first role if available
        if (rolesResponse.data.length > 0) {
          setSelectedRole(rolesResponse.data[0]);
        }
      }

      if (pagesResponse.success) {
        setPages(pagesResponse.data);
      }
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch role permissions when role is selected
  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole.roleId);
    }
  }, [selectedRole]);

  const fetchRolePermissions = async (roleId) => {
    try {
      const response = await adminApiService.getRolePagePermissions(roleId);
      if (response.success) {
        setRolePermissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      notificationService.error('Failed to fetch role permissions');
    }
  };

  // Handle page checkbox change (enables/disables all permissions for that page)
  const handlePageToggle = (pageId, isChecked) => {
    setRolePermissions(prev => 
      prev.map(page => {
        if (page.pageId === pageId) {
          return {
            ...page,
            permissions: page.permissions.map(permission => ({
              ...permission,
              isGranted: isChecked
            }))
          };
        }
        return page;
      })
    );
  };

  // Handle individual permission checkbox change
  const handlePermissionToggle = (pageId, permissionType, isChecked) => {
    setRolePermissions(prev => 
      prev.map(page => {
        if (page.pageId === pageId) {
          return {
            ...page,
            permissions: page.permissions.map(permission => {
              if (permission.permissionType === permissionType) {
                return { ...permission, isGranted: isChecked };
              }
              return permission;
            })
          };
        }
        return page;
      })
    );
  };

  // Check if all permissions for a page are granted
  const isPageFullyGranted = (pagePermissions) => {
    return pagePermissions.every(permission => permission.isGranted);
  };

  // Check if any permission for a page is granted
  const isPagePartiallyGranted = (pagePermissions) => {
    return pagePermissions.some(permission => permission.isGranted);
  };

  // Save role permissions
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      const response = await adminApiService.updateRolePermissions(selectedRole.roleId, {
        pagePermissions: rolePermissions
      });

      if (response.success) {
        notificationService.success('Permissions updated successfully');
      } else {
        notificationService.error(response.error || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      notificationService.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <h3 className="font-medium">Error</h3>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <svg className="w-8 h-8 mr-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Dynamic Permission Management
            </h2>
            <p className="text-slate-300 mt-2">Manage role-based page access and permissions</p>
          </div>
          {selectedRole && (
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
              variant="primary"
              className="bg-teal-600 hover:bg-teal-700"
            >
              {saving ? 'Saving...' : 'Update Permissions'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Left Sidebar - Roles */}
        <div className="w-1/4 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              System Roles
            </h3>
            <p className="text-sm text-gray-500 mt-1">Select a role to manage permissions</p>
          </div>
          
          <div className="overflow-y-auto h-full">
            {roles.map((role) => (
              <div
                key={role.roleId}
                onClick={() => setSelectedRole(role)}
                className={`p-4 cursor-pointer border-b border-gray-200 transition-colors ${
                  selectedRole?.roleId === role.roleId
                    ? 'bg-teal-50 border-l-4 border-l-teal-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    selectedRole?.roleId === role.roleId ? 'bg-teal-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{role.roleName}</h4>
                    <p className="text-sm text-gray-500">Role ID: {role.roleId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Permissions Table */}
        <div className="flex-1 flex flex-col">
          {selectedRole ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white">
                <h3 className="font-semibold text-gray-900">
                  Permissions for: <span className="text-teal-600">{selectedRole.roleName}</span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Check page boxes to enable all permissions, or manage individual permissions
                </p>
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Pages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Permissions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rolePermissions.map((page) => (
                      <tr key={page.pageId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isPageFullyGranted(page.permissions)}
                                onChange={(e) => handlePageToggle(page.pageId, e.target.checked)}
                                className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mr-3 cursor-pointer"
                              />
                              {isPagePartiallyGranted(page.permissions) && !isPageFullyGranted(page.permissions) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-2 h-2 bg-teal-600 rounded-sm"></div>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 flex items-center">
                                {page.pageName}
                                {isPageFullyGranted(page.permissions) && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Full Access
                                  </span>
                                )}
                                {isPagePartiallyGranted(page.permissions) && !isPageFullyGranted(page.permissions) && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Partial Access
                                  </span>
                                )}
                                {!isPagePartiallyGranted(page.permissions) && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    No Access
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Click to {isPagePartiallyGranted(page.permissions) ? 'disable all' : 'enable all'} permissions
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-3">
                            {page.permissions.map((permission) => {
                              const isPageSelected = isPagePartiallyGranted(page.permissions);
                              const isDisabled = !isPageSelected;

                              return (
                                <label
                                  key={permission.permissionType}
                                  className={`flex items-center transition-opacity ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={permission.isGranted}
                                    onChange={(e) => handlePermissionToggle(page.pageId, permission.permissionType, e.target.checked)}
                                    disabled={isDisabled}
                                    className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mr-2 ${
                                      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  />
                                  <span className={`text-sm capitalize font-medium ${
                                    permission.isGranted ? 'text-teal-700' :
                                    isDisabled ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {permission.permissionType}
                                  </span>
                                  {permission.isGranted && (
                                    <svg className="w-4 h-4 ml-1 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-500">Choose a role from the left sidebar to manage its permissions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPermissionManagement;
