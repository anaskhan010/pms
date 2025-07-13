import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { DeleteConfirmationModal } from '../common';
import RolePermissionModal from './RolePermissionModal';

const PermissionManagementPage = () => {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('permissions');
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const [permissionsResponse, rolesResponse] = await Promise.all([
        adminApiService.getAllPermissions(),
        adminApiService.getRolesWithPermissions()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600">Manage system permissions and role assignments</p>
        </div>
        {hasPermission('permissions.create') && (
          <Button
            onClick={handleCreatePermission}
            variant="primary"
            className="flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Permission
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Role Permissions
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
          {activeTab === 'permissions' && (
            <PermissionsTab
              permissions={permissions}
              onEdit={handleEditPermission}
              onDelete={handleDeletePermission}
              hasEditPermission={hasPermission('permissions.update')}
              hasDeletePermission={hasPermission('permissions.delete')}
            />
          )}
          
          {activeTab === 'roles' && (
            <RolePermissionsTab
              roles={roles}
              onManagePermissions={handleManageRolePermissions}
              hasManagePermission={hasPermission('permissions.assign')}
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

export default PermissionManagementPage;
