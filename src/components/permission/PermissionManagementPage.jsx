import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { DeleteConfirmationModal } from '../common';
import RolePermissionModal from './RolePermissionModal';
import DynamicPermissionManagement from './DynamicPermissionManagement';
import { PermissionGuard } from '../auth/ProtectedRoute';

const PermissionManagementPage = () => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dynamic');
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');

  // Modal states
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isRolePermissionModalOpen, setIsRolePermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    permissionId: null,
    permissionName: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [permissionsResponse, rolesResponse, usersResponse] = await Promise.all([
        adminApiService.getAllPermissions(),
        adminApiService.getRolesWithPermissions(),
        adminApiService.getAllUsers(1, 100) // Get first 100 users
      ]);

      if (permissionsResponse.success) {
        setPermissions(permissionsResponse.data);
      } else {
        setError(permissionsResponse.error);
      }

      if (rolesResponse.success) {
        setRoles(rolesResponse.data);
      } else {
        setError(rolesResponse.error);
      }

      if (usersResponse.success) {
        // Handle paginated response - extract users array from data
        const usersData = usersResponse.data?.users || usersResponse.data?.data || usersResponse.data || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        setError(usersResponse.error);
        setUsers([]); // Set empty array on error
      }
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = () => {
    setEditingPermission(null);
    setIsPermissionModalOpen(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setIsPermissionModalOpen(true);
  };

  const handleDeletePermission = (permission) => {
    setDeleteModal({
      isOpen: true,
      permissionId: permission.permissionId,
      permissionName: permission.permissionName
    });
  };

  const confirmDeletePermission = async () => {
    try {
      const response = await adminApiService.deletePermission(deleteModal.permissionId);
      
      if (response.success) {
        notificationService.success(response.message);
        fetchData();
      } else {
        notificationService.error(response.error);
      }
    } catch (error) {
      notificationService.error('Failed to delete permission');
    } finally {
      setDeleteModal({ isOpen: false, permissionId: null, permissionName: '' });
    }
  };

  const handleManageRolePermissions = (role) => {
    setSelectedRole(role);
    setIsRolePermissionModalOpen(true);
  };

  const groupPermissionsByResource = (permissions) => {
    const grouped = {};
    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  };

  if (!hasPermission('permissions.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Filter permissions based on search and resource
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource = selectedResource === 'all' || permission.resource === selectedResource;
    return matchesSearch && matchesResource;
  });

  // Get unique resources for filter dropdown
  const resources = [...new Set(permissions.map(p => p.resource))].sort();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-3xl font-bold">Permission Management</h1>
            </div>
            <p className="text-slate-300 mt-2">Enterprise-level access control and authorization system</p>
            <div className="flex items-center space-x-4 mt-3 text-sm">
              <span className="bg-teal-600 px-2 py-1 rounded">Total Permissions: {permissions.length}</span>
              <span className="bg-slate-700 px-2 py-1 rounded">Active Roles: {roles.length}</span>
              <span className="bg-slate-700 px-2 py-1 rounded">System Users: {users.length}</span>
            </div>
          </div>
          <PermissionGuard permissions={['permissions.create']}>
            <Button
              onClick={handleCreatePermission}
              variant="primary"
              className="flex items-center bg-teal-600 hover:bg-teal-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Permission
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search permissions, resources, or actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Resources</option>
              {resources.map(resource => (
                <option key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-0">
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ${
              activeTab === 'dynamic'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Dynamic Permissions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ${
              activeTab === 'permissions'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Permissions</span>
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{filteredPermissions.length}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ${
              activeTab === 'roles'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Role Permissions</span>
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{roles.length}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>User Access</span>
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{Array.isArray(users) ? users.length : 0}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dynamic' && (
            <div className="p-6">
              <DynamicPermissionManagement />
            </div>
          )}

          {activeTab === 'permissions' && (
            <PermissionsTab
              permissions={filteredPermissions}
              onEdit={handleEditPermission}
              onDelete={handleDeletePermission}
              hasEditPermission={hasPermission('permissions.update')}
              hasDeletePermission={hasPermission('permissions.delete')}
              searchTerm={searchTerm}
              selectedResource={selectedResource}
            />
          )}

          {activeTab === 'roles' && (
            <RolePermissionsTab
              roles={roles}
              onManagePermissions={handleManageRolePermissions}
              hasManagePermission={hasPermission('permissions.assign')}
            />
          )}

          {activeTab === 'users' && (
            <UserAccessTab
              users={users}
              roles={roles}
              hasManagePermission={hasPermission('users.update')}
            />
          )}
        </>
      )}

      {/* Modals */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        permission={editingPermission}
        onSuccess={fetchData}
      />

      <RolePermissionModal
        isOpen={isRolePermissionModalOpen}
        onClose={() => setIsRolePermissionModalOpen(false)}
        role={selectedRole}
        permissions={permissions}
        onSuccess={fetchData}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, permissionId: null, permissionName: '' })}
        onConfirm={confirmDeletePermission}
        title="Delete Permission"
        message={`Are you sure you want to delete "${deleteModal.permissionName}"? This action cannot be undone.`}
      />
    </div>
  );
};

// Permissions Tab Component
const PermissionsTab = ({ permissions, onEdit, onDelete, hasEditPermission, hasDeletePermission }) => {
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
        <div key={resource} className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 capitalize">{resource} Permissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Roles
                  </th>
                  {(hasEditPermission || hasDeletePermission) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resourcePermissions.map((permission) => (
                  <tr key={permission.permissionId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {permission.permissionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {permission.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {permission.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {permission.assignedRoles || 0} roles
                    </td>
                    {(hasEditPermission || hasDeletePermission) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {hasEditPermission && (
                            <button
                              onClick={() => onEdit(permission)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => onDelete(permission)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Role Permissions Tab Component
const RolePermissionsTab = ({ roles, onManagePermissions, hasManagePermission }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Role Permissions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key Permissions
              </th>
              {hasManagePermission && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.roleId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className="capitalize">{role.roleName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.permissions?.length || 0} permissions
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 3).map((permission) => (
                      <span
                        key={permission.permissionId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {permission.resource}.{permission.action}
                      </span>
                    ))}
                    {role.permissions?.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                {hasManagePermission && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onManagePermissions(role)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Permissions
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Permission Modal Component
const PermissionModal = ({ isOpen, onClose, permission, onSuccess }) => {
  const [formData, setFormData] = useState({
    permissionName: '',
    resource: '',
    action: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission) {
      setFormData({
        permissionName: permission.permissionName || '',
        resource: permission.resource || '',
        action: permission.action || '',
        description: permission.description || ''
      });
    } else {
      setFormData({
        permissionName: '',
        resource: '',
        action: '',
        description: ''
      });
    }
  }, [permission, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (permission) {
        response = await adminApiService.updatePermission(permission.permissionId, formData);
      } else {
        response = await adminApiService.createPermission(formData);
      }

      if (response.success) {
        notificationService.success(response.message);
        onSuccess();
        onClose();
      } else {
        notificationService.error(response.error);
      }
    } catch (error) {
      notificationService.error('Failed to save permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={permission ? 'Edit Permission' : 'Create Permission'}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700 mb-1">
            Permission Name *
          </label>
          <input
            type="text"
            id="permissionName"
            value={formData.permissionName}
            onChange={(e) => setFormData({ ...formData, permissionName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g., users.create"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-1">
              Resource *
            </label>
            <input
              type="text"
              id="resource"
              value={formData.resource}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., users"
              required
            />
          </div>

          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <input
              type="text"
              id="action"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., create"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="Brief description of what this permission allows"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {permission ? 'Update Permission' : 'Create Permission'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Enhanced User Access Tab Component
const UserAccessTab = ({ users = [], roles = [], hasManagePermission = false }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  const fetchUserPermissions = async (userId) => {
    setLoadingUser(true);
    try {
      const response = await adminApiService.getUserPermissions(userId);
      if (response.success) {
        setUserPermissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserPermissions(user.userId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Access Overview</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">System Users</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {safeUsers.length > 0 ? (
                safeUsers.map(user => (
                  <div
                    key={user.userId}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedUser?.userId === user.userId
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {user.roleName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* User Permissions */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">
              {selectedUser ? `Permissions for ${selectedUser.firstName} ${selectedUser.lastName}` : 'Select a user to view permissions'}
            </h4>

            {selectedUser ? (
              <div className="border border-gray-200 rounded-lg p-4">
                {loadingUser ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userPermissions.length > 0 ? (
                      userPermissions.map(permission => (
                        <div key={permission.permissionId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium text-gray-900">{permission.permissionName}</span>
                            <p className="text-sm text-gray-500">{permission.description}</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded">
                            {permission.resource}.{permission.action}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No permissions found for this user</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>Select a user from the list to view their permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagementPage;
