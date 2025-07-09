import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApiService from "../../services/adminApiService";
import notificationService from "../../services/notificationService";
import { DeleteConfirmationModal } from "../common";
import AddBuildingModal from "./AddBuildingModal";

const BuildingsPage = () => {
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
        await fetchBuildings(); // Refresh the buildings list
        setIsModalOpen(false);
        resetForm();
      } else {
        setError(response.error || 'Failed to save building');
      }
    } catch (err) {
      console.error('Error saving building:', err);
      setError('An unexpected error occurred while saving building');
    } finally {
      setLoading(false);
    }
  };

  const handleComprehensiveSubmit = async (comprehensiveData) => {
    setLoading(true);
    try {
      const response = await adminApiService.createComprehensiveBuilding(comprehensiveData);

      if (response.success) {
        notificationService.success('Building created successfully with all floors and apartments');
        await fetchBuildings(); // Refresh the buildings list
        setIsModalOpen(false);
        setError(null);
      } else {
        notificationService.error(response.error || 'Failed to create building');
        setError(response.error || 'Failed to create building');
      }
    } catch (err) {
      console.error('Error creating comprehensive building:', err);
      notificationService.error('An unexpected error occurred while creating building');
      setError('An unexpected error occurred while creating building');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (building) => {
    setIsEditMode(true);
    setEditingBuildingId(building.id);
    setFormData({
      buildingName: building.name,
      buildingAddress: building.address,
    });
    setIsModalOpen(true);
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

  const resetForm = () => {
    setFormData({
      buildingName: "",
      buildingAddress: "",
    });
    setSelectedImages([]);
    setIsEditMode(false);
    setEditingBuildingId(null);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Buildings</h1>
        <div className="flex space-x-3">
         
          <button
            onClick={() => {
              setUseComprehensiveModal(true);
              setIsModalOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Add Building with Floors & Apartments
          </button>
        </div>
      </div>

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
                    <Link
                      to={`/admin/buildings/${building.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </Link>
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEdit(building)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(building.id, building.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modals */}
      {isModalOpen && useComprehensiveModal && (
        <AddBuildingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleComprehensiveSubmit}
          loading={loading}
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

    </div>
  );
};

export default BuildingsPage;
