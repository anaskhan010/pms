import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';

const RolePermissionModal = ({ isOpen, onClose, role, permissions, onSuccess }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (role && isOpen) {
      // Set currently assigned permissions
      const assignedPermissionIds = role.permissions?.map(p => p.permissionId) || [];
      setSelectedPermissions(assignedPermissionIds);
    }
  }, [role, isOpen]);

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAll = (resourcePermissions) => {
    const resourcePermissionIds = resourcePermissions.map(p => p.permissionId);
    const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all permissions for this resource
      setSelectedPermissions(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
    } else {
      // Select all permissions for this resource
      setSelectedPermissions(prev => {
        const newSelected = [...prev];
        resourcePermissionIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApiService.assignPermissionsToRole(role.roleId, selectedPermissions);
      
      if (response.success) {
        notificationService.success(response.message);
        onSuccess();
        onClose();
      } else {
        notificationService.error(response.error);
      }
    } catch (error) {
      notificationService.error('Failed to update role permissions');
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  // Filter permissions based on search term
  const filteredGroupedPermissions = Object.entries(groupedPermissions).reduce((acc, [resource, resourcePermissions]) => {
    if (searchTerm) {
      const filtered = resourcePermissions.filter(permission =>
        permission.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[resource] = filtered;
      }
    } else {
      acc[resource] = resourcePermissions;
    }
    return acc;
  }, {});

  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Permissions for ${role.roleName}`}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="p-6">
        {/* Search */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Permissions
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="Search by permission name, action, or description..."
          />
        </div>

        {/* Permission Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Permission Summary</h4>
              <p className="text-sm text-gray-600">
                {selectedPermissions.length} of {permissions.length} permissions selected
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPermissions([])}
              >
                Clear All
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPermissions(permissions.map(p => p.permissionId))}
              >
                Select All
              </Button>
            </div>
          </div>
        </div>

        {/* Permissions by Resource */}
        <div className="space-y-6 max-h-96  overflow-y-auto">
          {Object.entries(filteredGroupedPermissions).map(([resource, resourcePermissions]) => {
            const allSelected = resourcePermissions.every(p => selectedPermissions.includes(p.permissionId));
            const someSelected = resourcePermissions.some(p => selectedPermissions.includes(p.permissionId));

            return (
              <div key={resource} className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {resource} Permissions ({resourcePermissions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(resourcePermissions)}
                    className={`text-sm font-medium ${
                      allSelected
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-teal-600 hover:text-teal-700'
                    }`}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {resourcePermissions.map((permission) => (
                      <label
                        key={permission.permissionId}
                        className="flex items-start space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.permissionId)}
                          onChange={() => handlePermissionToggle(permission.permissionId)}
                          className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {permission.permissionName}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {permission.action}
                            </span>
                          </div>
                          {permission.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
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
            Update Permissions
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RolePermissionModal;
