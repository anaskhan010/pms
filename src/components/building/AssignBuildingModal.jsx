import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';

const AssignBuildingModal = ({ isOpen, onClose, building, onAssignSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users with roleId = 2 (owner role)
  const fetchOwnerUsers = async () => {
    try {
      setFetchingUsers(true);
      setError(null);
      const response = await adminApiService.getUsersByRole(2);
      
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch users');
        notificationService.error(response.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching owner users:', error);
      setError('Failed to fetch users');
      notificationService.error('Failed to fetch users');
    } finally {
      setFetchingUsers(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId('');
      setError(null);
      fetchOwnerUsers();
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      notificationService.error('Please select a user');
      return;
    }

    try {
      setLoading(true);
      const response = await adminApiService.assignBuildingToUser(building.id, selectedUserId);

      if (response.success) {
        notificationService.success(response.message || 'Building assigned successfully');
        onAssignSuccess && onAssignSuccess();

        // Add a small delay before closing to ensure notification is visible
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        notificationService.error(response.error || 'Failed to assign building');
      }
    } catch (error) {
      console.error('Error assigning building:', error);
      notificationService.error('Failed to assign building');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Assign Building To User`}
      size="medium"
    >
      <div className="p-6">
        {/* Building Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Building Details</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {building?.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Address:</span> {building?.address}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Units:</span> {building?.units || 0}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Floors:</span> {building?.floors || 0}
            </p>
          </div>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select User (Owner Role Only)
            </label>
            
            {fetchingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={fetchOwnerUsers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No users with owner role found</p>
              </div>
            ) : (
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUserId || fetchingUsers}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                'Assign Building'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AssignBuildingModal;
