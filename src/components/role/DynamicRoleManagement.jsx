import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';
import PermissionGuard from '../auth/PermissionGuard';

const DynamicRoleManagement = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleStats, setRoleStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByType, setFilterByType] = useState('all');
  const [formData, setFormData] = useState({
    roleName: '',
    roleDescription: '',
    parentRoleId: null,
    maxSubRoles: 0,
    pagePermissions: [],
    resourcePermissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchTemplate();
    fetchRoleStats();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await adminApiService.getAllRolesWithHierarchy();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      notificationService.error('Failed to fetch roles');
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await adminApiService.getRoleCreationTemplate();
      if (response.success) {
        setTemplate(response.data);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleStats = async () => {
    try {
      const response = await adminApiService.getRoleStatistics();
      if (response.success) {
        setRoleStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching role statistics:', error);
    }
  };

  const handleCreateRole = () => {
    setFormData({
      roleName: '',
      roleDescription: '',
      parentRoleId: null,
      maxSubRoles: 0,
      pagePermissions: template?.pages?.map(page => ({
        pageId: page.pageId,
        pageName: page.pageName,
        permissions: {
          view: false,
          create: false,
          update: false,
          delete: false,
          manage: false
        }
      })) || [],
      resourcePermissions: template?.resourceTypes?.map(resourceType => ({
        resourceType,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canViewOwn: true
      })) || []
    });
    setShowCreateModal(true);
  };

  const handleEditRole = async (role) => {
    try {
      const response = await adminApiService.getRoleWithPermissions(role.roleId);
      if (response.success) {
        setSelectedRole(response.data);
        
        // Transform page permissions for editing
        const pagePermissionsMap = {};
        response.data.pagePermissions.forEach(perm => {
          if (!pagePermissionsMap[perm.pageId]) {
            pagePermissionsMap[perm.pageId] = {
              pageId: perm.pageId,
              pageName: perm.pageName,
              permissions: {}
            };
          }
          pagePermissionsMap[perm.pageId].permissions[perm.permissionType] = perm.isGranted;
        });

        setFormData({
          roleName: response.data.roleName,
          roleDescription: response.data.roleDescription,
          parentRoleId: response.data.parentRoleId,
          maxSubRoles: response.data.maxSubRoles,
          pagePermissions: Object.values(pagePermissionsMap),
          resourcePermissions: response.data.resourcePermissions
        });
        
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
      notificationService.error('Failed to fetch role details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Transform page permissions for API
      const pagePermissions = [];
      formData.pagePermissions.forEach(page => {
        Object.entries(page.permissions).forEach(([permissionType, isGranted]) => {
          if (isGranted) {
            pagePermissions.push({
              pageId: page.pageId,
              permissionType,
              isGranted: true
            });
          }
        });
      });

      const roleData = {
        ...formData,
        pagePermissions,
        resourcePermissions: formData.resourcePermissions
      };

      let response;
      if (showEditModal && selectedRole) {
        response = await adminApiService.updateRolePermissions(selectedRole.roleId, {
          pagePermissions,
          resourcePermissions: formData.resourcePermissions
        });
      } else {
        response = await adminApiService.createCustomRole(roleData);
      }

      if (response.success) {
        notificationService.success(
          showEditModal ? 'Role updated successfully' : 'Role created successfully'
        );
        setShowCreateModal(false);
        setShowEditModal(false);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error saving role:', error);
      notificationService.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    setSelectedRole(roles.find(r => r.roleId === roleId));
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await adminApiService.deleteCustomRole(selectedRole.roleId);
      if (response.success) {
        notificationService.success('Role deleted successfully');
        setShowDeleteModal(false);
        setSelectedRole(null);
        fetchRoles();
        fetchRoleStats();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      notificationService.error('Failed to delete role');
    }
  };

  // Enhanced filtering and search
  const getFilteredRoles = () => {
    let filtered = roles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.roleDescription && role.roleDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filterByType !== 'all') {
      filtered = filtered.filter(role => {
        switch (filterByType) {
          case 'system':
            return role.roleId <= 6; // System roles
          case 'custom':
            return role.roleId > 6 || role.roleName.startsWith('owner_'); // Custom roles
          case 'admin':
            return role.roleId === 1;
          case 'owner':
            return role.roleId === 2;
          case 'staff':
            return role.roleId >= 3 && role.roleId <= 6;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const getRoleTypeLabel = (role) => {
    if (role.roleId === 1) return 'Admin';
    if (role.roleId === 2) return 'Owner';
    if (role.roleId >= 3 && role.roleId <= 6) return 'Staff';
    if (role.roleName.startsWith('owner_')) return 'Custom Owner';
    return 'Custom';
  };

  const getRoleTypeColor = (role) => {
    if (role.roleId === 1) return 'bg-red-100 text-red-800';
    if (role.roleId === 2) return 'bg-blue-100 text-blue-800';
    if (role.roleId >= 3 && role.roleId <= 6) return 'bg-green-100 text-green-800';
    if (role.roleName.startsWith('owner_')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handlePagePermissionChange = (pageIndex, permissionType, value) => {
    const updatedPagePermissions = [...formData.pagePermissions];
    updatedPagePermissions[pageIndex].permissions[permissionType] = value;
    
    // If view is unchecked, uncheck all other permissions
    if (permissionType === 'view' && !value) {
      Object.keys(updatedPagePermissions[pageIndex].permissions).forEach(key => {
        updatedPagePermissions[pageIndex].permissions[key] = false;
      });
    }
    // If any other permission is checked, automatically check view
    else if (permissionType !== 'view' && value) {
      updatedPagePermissions[pageIndex].permissions.view = true;
    }

    setFormData({ ...formData, pagePermissions: updatedPagePermissions });
  };

  const handleResourcePermissionChange = (resourceIndex, permissionType, value) => {
    const updatedResourcePermissions = [...formData.resourcePermissions];
    updatedResourcePermissions[resourceIndex][permissionType] = value;
    
    // If canRead is unchecked, uncheck all other permissions
    if (permissionType === 'canRead' && !value) {
      Object.keys(updatedResourcePermissions[resourceIndex]).forEach(key => {
        if (key.startsWith('can')) {
          updatedResourcePermissions[resourceIndex][key] = false;
        }
      });
    }
    // If any other permission is checked, automatically check canRead
    else if (permissionType !== 'canRead' && permissionType.startsWith('can') && value) {
      updatedResourcePermissions[resourceIndex].canRead = true;
    }

    setFormData({ ...formData, resourcePermissions: updatedResourcePermissions });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const filteredRoles = getFilteredRoles();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dynamic Role Management</h1>
          <p className="text-gray-600 mt-1">
            Manage roles and permissions for your organization
          </p>
        </div>
        <PermissionGuard permission="roles.create">
          <button
            onClick={handleCreateRole}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Custom Role</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      {roleStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {roleStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stat.type === 'admin' ? 'bg-red-100' :
                    stat.type === 'owner' ? 'bg-blue-100' :
                    stat.type === 'staff' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      stat.type === 'admin' ? 'text-red-600' :
                      stat.type === 'owner' ? 'text-blue-600' :
                      stat.type === 'staff' ? 'text-green-600' : 'text-purple-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterByType}
              onChange={(e) => setFilterByType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Types</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="staff">Staff</option>
            </select>
            <div className="text-sm text-gray-500">
              {filteredRoles.length} of {roles.length} roles
            </div>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterByType !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by creating a custom role.'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
              <tr key={role.roleId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getRoleTypeColor(role)}`}>
                        <span className="text-xs font-semibold">
                          {role.roleName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {role.roleName}
                      </div>
                      {role.roleDescription && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {role.roleDescription}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleTypeColor(role)}`}>
                    {getRoleTypeLabel(role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{role.userCount || 0}</div>
                  <div className="text-sm text-gray-500">users</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{role.permissionCount || 0}</div>
                  <div className="text-sm text-gray-500">permissions</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{role.pageCount || 0}</div>
                  <div className="text-sm text-gray-500">pages</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <PermissionGuard permission="roles.update">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Edit
                      </button>
                    </PermissionGuard>
                    {role.isCustomRole && (
                      <PermissionGuard permission="roles.delete">
                        <button
                          onClick={() => handleDeleteRole(role.roleId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Role Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showEditModal ? 'Edit Role' : 'Create Custom Role'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Role Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role Name</label>
                    <input
                      type="text"
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Role</label>
                    <select
                      value={formData.parentRoleId || ''}
                      onChange={(e) => setFormData({ ...formData, parentRoleId: e.target.value || null })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">No Parent Role</option>
                      {template?.parentRoles?.map(role => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.roleDescription}
                    onChange={(e) => setFormData({ ...formData, roleDescription: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    required
                  />
                </div>

                {/* Page Permissions */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Page Permissions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Create</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Update</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.pagePermissions.map((page, index) => (
                          <tr key={page.pageId}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {page.pageName}
                            </td>
                            {['view', 'create', 'update', 'delete', 'manage'].map(permType => (
                              <td key={permType} className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={page.permissions[permType] || false}
                                  onChange={(e) => handlePagePermissionChange(index, permType, e.target.checked)}
                                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resource Permissions */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Resource Permissions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Read</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Create</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Update</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Assign</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View All</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View Own</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.resourcePermissions.map((resource, index) => (
                          <tr key={resource.resourceType}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 capitalize">
                              {resource.resourceType.replace('_', ' ')}
                            </td>
                            {['canRead', 'canCreate', 'canUpdate', 'canDelete', 'canAssign', 'canViewAll', 'canViewOwn'].map(permType => (
                              <td key={permType} className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={resource[permType] || false}
                                  onChange={(e) => handleResourcePermissionChange(index, permType, e.target.checked)}
                                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md"
                  >
                    {showEditModal ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-2 px-7 py-3">
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  Delete Role
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 text-center">
                    Are you sure you want to delete the role "{selectedRole.roleName}"?
                  </p>
                  {selectedRole.userCount > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This role has {selectedRole.userCount} user(s) assigned.
                            Deleting this role will remove it from all assigned users.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 text-center mt-3">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedRole(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteRole}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Delete Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicRoleManagement;
