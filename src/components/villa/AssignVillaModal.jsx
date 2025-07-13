import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';

const AssignVillaModal = ({ isOpen, onClose, villa, onAssignSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
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
      notificationService.error('Please select an owner');
      return;
    }

    try {
      setLoading(true);
      const response = await adminApiService.assignVillaToOwner(villa.villasId, selectedUserId);

      if (response.success) {
        notificationService.success(response.message || 'Villa assigned successfully');
        onAssignSuccess && onAssignSuccess();

        // Add a small delay before closing to ensure notification is visible
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        notificationService.error(response.error || 'Failed to assign villa');
      }
    } catch (error) {
      console.error('Error assigning villa:', error);
      notificationService.error('Failed to assign villa');
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

  if (!villa) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Villa to Owner"
      size="default"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Villa Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Villa Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{villa.Name}</span>
            </div>
            <div>
              <span className="text-gray-600">Address:</span>
              <span className="ml-2 font-medium">{villa.Address}</span>
            </div>
            <div>
              <span className="text-gray-600">Price:</span>
              <span className="ml-2 font-medium">SAR {villa.price?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">{villa.status}</span>
            </div>
          </div>
        </div>

        {/* Owner Selection */}
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-2">
            Select Owner *
          </label>
          {fetchingUsers ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-gray-600">Loading owners...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          ) : (
            <select
              id="owner"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            >
              <option value="">Select an owner...</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          )}
          {users.length === 0 && !fetchingUsers && !error && (
            <p className="text-sm text-gray-500 mt-1">
              No owners available. Please create owner accounts first.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!selectedUserId || fetchingUsers}
          >
            {loading ? 'Assigning...' : 'Assign Villa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignVillaModal;
