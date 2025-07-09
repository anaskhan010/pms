import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import notificationService from '../../services/notificationService';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getUserById(id);
      
      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.error);
        notificationService.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
      notificationService.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/user-management');
  };

  // Handle edit user
  const handleEdit = () => {
    navigate('/admin/user-management', { state: { editUser: user } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Back to User Management
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">User not found</div>
        <button
          onClick={handleBack}
          className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Back to User Management
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
        </div>
        <button
          onClick={handleEdit}
          className="bg-gradient-to-r from-slate-900 to-teal-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit User
        </button>
      </div>

      {/* User Details Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-800 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  src={`${import.meta.env.VITE_APP_IMAGE_URL}${user.image}`}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-blue-600 text-2xl font-bold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-blue-100 text-lg mt-1">{user.email}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-white bg-opacity-20 text-white">
                  {user.roleName || 'No Role'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-gray-900 mt-1">{user.phoneNumber || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 mt-1">{user.gender || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-gray-900 mt-1">{user.nationality || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900 mt-1">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Contact Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900 mt-1">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-gray-900 mt-1">{user.phoneNumber || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900 mt-1">
                  {user.address || 'Not provided'}
                </p>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                System Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="text-gray-900 mt-1">{user.userId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 mt-1">
                  <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.roleName || 'No Role'}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          {(user.address || user.nationality || user.dateOfBirth) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Full Address</label>
                      <p className="text-gray-900 mt-1">{user.address}</p>
                    </div>
                  )}
                  {user.nationality && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Nationality</label>
                      <p className="text-gray-900 mt-1">{user.nationality}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      
    </div>
  );
};

export default UserDetailsPage;
