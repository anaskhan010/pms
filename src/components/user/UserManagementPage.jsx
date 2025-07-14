import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionContext';
import { PermissionGuard } from '../auth/ProtectedRoute';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';
import { DeleteConfirmationModal } from '../common';
import UserModal from './UserModal';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roles, setRoles] = useState([]);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    loading: false
  });

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getAllUsers(page, 10);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setPagination(response.data.pagination || {});
      } else {
        setError(response.error);
        notificationService.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      notificationService.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const response = await adminApiService.getUserRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    fetchRoles();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Handle view user
  const handleViewUser = (userId) => {
    navigate(`/admin/user-management/${userId}`);
  };

  // Handle delete user
  const handleDeleteUser = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      loading: false
    });
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const response = await adminApiService.deleteUser(deleteModal.userId);
      
      if (response.success) {
        notificationService.success('User deleted successfully');
        fetchUsers(currentPage);
        setDeleteModal({ isOpen: false, userId: null, userName: '', loading: false });
      } else {
        notificationService.error(response.error);
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      notificationService.error('An error occurred while deleting the user');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Cancel delete user
  const cancelDeleteUser = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '', loading: false });
  };

  // Handle user save (create/update)
  const handleUserSave = async (userData) => {
    try {
      let response;
      if (editingUser) {
        response = await adminApiService.updateUser(editingUser.userId, userData);
      } else {
        response = await adminApiService.createUser(userData);
      }

      if (response.success) {
        // Handle building assignments for owners
        if (userData.assignedBuildings && userData.assignedBuildings.length > 0) {
          const userId = response.data?.userId || editingUser?.userId;
          if (userId) {
            await handleBuildingAssignments(userId, userData.assignedBuildings);
          }
        }

        notificationService.success(response.message);
        setIsModalOpen(false);
        setEditingUser(null);
        fetchUsers(currentPage);
      } else {
        notificationService.error(response.error);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      notificationService.error('An error occurred while saving the user');
    }
  };

  // Handle building assignments for owners
  const handleBuildingAssignments = async (userId, buildingIds) => {
    try {
      // Assign each building to the owner
      for (const buildingId of buildingIds) {
        await fetch('/api/buildings/assignBuildingToOwner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            buildingId,
            userId
          })
        });
      }
    } catch (error) {
      console.error('Error assigning buildings:', error);
      notificationService.error('User created but failed to assign buildings');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <PermissionGuard permissions={['users.create']}>
          <button
            onClick={handleAddUser}
            className="bg-gradient-to-r from-slate-900 to-teal-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </PermissionGuard>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user && user.image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`${import.meta.env.VITE_APP_IMAGE_URL}${user.image}`}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.nationality}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.roleName || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <PermissionGuard permissions={['users.view']}>
                        <button
                          onClick={() => handleViewUser(user.userId)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permissions={['users.update']}>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                        >
                          Edit
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permissions={['users.delete']}>
                        <button
                          onClick={() => handleDeleteUser(user.userId, `${user.firstName} ${user.lastName}`)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalUsers} total users)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleUserSave}
          user={editingUser}
          roles={roles}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
        itemName={deleteModal.userName}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default UserManagementPage;
