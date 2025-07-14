import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import { PermissionGuard } from "../auth/ProtectedRoute";
import adminApiService from "../../services/adminApiService";
import notificationService from "../../services/notificationService";
import { DeleteConfirmationModal } from "../common";
import AddBuildingModal from "./AddBuildingModal";
import AssignBuildingModal from "./AssignBuildingModal";
import PageBanner from "../common/PageBanner";
import NoDataAssigned from "../common/NoDataAssigned";

const BuildingsPage = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getBuildings();

      if (response.success) {
        // Map the API response to match the expected structure
        const mappedBuildings = response.data.map(building => ({
          id: building.buildingId,
          name: building.buildingName,
          address: building.buildingAddress,
          units: building.totalApartments || 0,
          floors: building.totalFloors || 0,
          yearBuilt: new Date(building.buildingCreatedDate).getFullYear() || 2020,
          status: "Operational" // Default status since API doesn't provide this
        }));
        setBuildings(mappedBuildings);
      } else {
        setError(response.error || 'Failed to fetch buildings');
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setError('An unexpected error occurred while fetching buildings');
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    buildingName: "",
    buildingAddress: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [useComprehensiveModal, setUseComprehensiveModal] = useState(false);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    buildingId: null,
    buildingName: '',
    loading: false
  });

  // Assign building modal state
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    building: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isEditMode) {
        response = await adminApiService.updateBuilding(editingBuildingId, formData, selectedImages);
      } else {
        response = await adminApiService.createBuilding(formData, selectedImages);
      }

      if (response.success) {
        notificationService.success(isEditMode ? 'Building updated successfully!' : 'Building created successfully!');
        await fetchBuildings(); // Refresh the buildings list
        setIsModalOpen(false);
        resetForm();
        setError(null);
      } else {
        const errorMessage = response.error || 'Failed to save building';
        notificationService.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error saving building:', err);
      const errorMessage = 'An unexpected error occurred while saving building';
      notificationService.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleComprehensiveSubmit = async (comprehensiveData) => {
    setLoading(true);
    try {
      let response;

      if (isEditMode && editingBuildingId) {
        response = await adminApiService.updateComprehensiveBuilding(editingBuildingId, comprehensiveData);
        if (response.success) {
          notificationService.success('Building updated successfully!');
        }
      } else {
        response = await adminApiService.createComprehensiveBuilding(comprehensiveData);
        if (response.success) {
          notificationService.success('Building created successfully with all floors and apartments');
        }
      }

      if (response.success) {
        await fetchBuildings(); // Refresh the buildings list
        setIsModalOpen(false);
        resetForm();
        setError(null);
      } else {
        const errorMessage = response.error || (isEditMode ? 'Failed to update building' : 'Failed to create building');
        notificationService.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error with comprehensive building operation:', err);
      const errorMessage = `An unexpected error occurred while ${isEditMode ? 'updating' : 'creating'} building`;
      notificationService.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (building) => {
    try {
      setLoading(true);

      // Fetch comprehensive building data for editing
      const response = await adminApiService.getComprehensiveBuildingById(building.id);

      if (response.success) {
        setIsEditMode(true);
        setEditingBuildingId(building.id);
        setEditData(response.data);
        setUseComprehensiveModal(true);
        setIsModalOpen(true);
      } else {
        setError(response.error || 'Failed to fetch building details for editing');
      }
    } catch (err) {
      console.error('Error fetching building for edit:', err);
      setError('An unexpected error occurred while fetching building details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, buildingName = '') => {
    setDeleteModal({
      isOpen: true,
      buildingId: id,
      buildingName,
      loading: false
    });
  };

  const confirmDeleteBuilding = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const response = await adminApiService.deleteBuilding(deleteModal.buildingId);
      if (response.success) {
        notificationService.success('Building deleted successfully');
        await fetchBuildings(); // Refresh the buildings list
        setDeleteModal({ isOpen: false, buildingId: null, buildingName: '', loading: false });
      } else {
        notificationService.error(response.error || 'Failed to delete building');
        setDeleteModal(prev => ({ ...prev, loading: false }));
        setError(response.error || 'Failed to delete building');
      }
    } catch (err) {
      console.error('Error deleting building:', err);
      notificationService.error('An unexpected error occurred while deleting building');
      setDeleteModal(prev => ({ ...prev, loading: false }));
      setError('An unexpected error occurred while deleting building');
    }
  };

  const cancelDeleteBuilding = () => {
    setDeleteModal({ isOpen: false, buildingId: null, buildingName: '', loading: false });
  };

  // Handle assign building to user
  const handleAssignBuilding = (building) => {
    setAssignModal({
      isOpen: true,
      building: building
    });
  };

  // Handle assign building modal close
  const handleAssignModalClose = () => {
    setAssignModal({
      isOpen: false,
      building: null
    });
  };

  // Handle successful assignment
  const handleAssignSuccess = () => {
    // Optionally refresh buildings list or show success message
    // The success notification is already handled in the modal
    fetchBuildings();
  };

  const resetForm = () => {
    setFormData({
      buildingName: "",
      buildingAddress: "",
    });
    setSelectedImages([]);
    setIsEditMode(false);
    setEditingBuildingId(null);
    setEditData(null);
    setUseComprehensiveModal(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };


  const truncateWords = (text, maxWords = 90) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    return words.length <= maxWords
      ? text
      : words.slice(0, maxWords).join(' ') + '…';
  };
  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <PageBanner
        title="Building Management"
        subtitle="Manage buildings, floors, and apartments with comprehensive controls"
        icon={
          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        stats={[
          {
            value: buildings.length,
            label: "Total Buildings",
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          },
          {
            value: user?.role === 'owner' ? 'Assigned Buildings' : 'All Buildings',
            label: "Access Level",
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          }
        ]}
        actions={[
          {
            label: "Add Building",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
            onClick: () => {
              setUseComprehensiveModal(true);
              setIsModalOpen(true);
            },
            variant: 'primary'
          }
        ]}
        gradient="from-blue-900 via-blue-800 to-slate-900"
      />

      <div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={fetchBuildings}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Buildings Table */}
      {!loading && !error && (
        buildings.length === 0 ? (
          <NoDataAssigned
            type="buildings"
            userRole={user?.role || 'user'}
          />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Floors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Year Built
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {buildings.map((building) => (
                <tr key={building.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {building.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {building.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {building.address.length > 90 ? building.address.slice(0, 60) + '...' : building.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {building.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {building.floors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {building.yearBuilt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        building.status === "Operational"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {building.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <PermissionGuard permissions={['buildings.view', 'buildings.view_own']}>
                      <Link
                        to={`/admin/buildings/${building.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                    </PermissionGuard>
                    <PermissionGuard permissions={['buildings.update', 'buildings.update_own']}>
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEdit(building)}
                      >
                        Edit
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permissions={['buildings.delete']}>
                      <button
                        className="text-red-600 hover:text-red-900 mr-3"
                        onClick={() => handleDelete(building.id, building.name)}
                      >
                        Delete
                      </button>
                    </PermissionGuard>
                    {user?.roleId === 1 && (
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleAssignBuilding(building)}
                      >
                        Assign Building To User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        )
      )}

      {/* Modals */}
      {isModalOpen && useComprehensiveModal && (
        <AddBuildingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleComprehensiveSubmit}
          loading={loading}
          editData={editData}
          isEditMode={isEditMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteBuilding}
        onConfirm={confirmDeleteBuilding}
        title="Delete Building"
        message="Are you sure you want to delete this building? This action cannot be undone and will remove all associated floors, apartments, and tenant data."
        itemName={deleteModal.buildingName}
        loading={deleteModal.loading}
      />

      {/* Assign Building Modal */}
      <AssignBuildingModal
        isOpen={assignModal.isOpen}
        onClose={handleAssignModalClose}
        building={assignModal.building}
        onAssignSuccess={handleAssignSuccess}
      />
      </div>
    </div>
  );
};

export default BuildingsPage;
