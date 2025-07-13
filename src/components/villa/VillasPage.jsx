import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VillaCard from "./VillaCard";
import VillaFilters from "./VillaFilters";
import AddVillaModal from "./AddVillaModal";
import EditVillaModal from "./EditVillaModal";
import AssignVillaModal from "./AssignVillaModal";
import villaApiService from "../../services/villaApiService";
import notificationService from "../../services/notificationService";
import { DeleteConfirmationModal } from "../common";

const VillasPage = () => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVillaId, setEditingVillaId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVillaForAssignment, setSelectedVillaForAssignment] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    villaId: null,
    villaName: ''
  });

  // Fetch villas on component mount
  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    try {
      setLoading(true);
      const response = await villaApiService.getVillas();
      setVillas(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching villas:', error);
      setError('Failed to fetch villas');
      notificationService.error('Failed to fetch villas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVilla = async (villaId) => {
    try {
      await villaApiService.deleteVilla(villaId);
      notificationService.success('Villa deleted successfully');
      fetchVillas(); // Refresh the list
      setDeleteModal({ isOpen: false, villaId: null, villaName: '' });
    } catch (error) {
      console.error('Error deleting villa:', error);
      notificationService.error('Failed to delete villa');
    }
  };

  const openDeleteModal = (villa) => {
    setDeleteModal({
      isOpen: true,
      villaId: villa.villasId,
      villaName: villa.Name
    });
  };

  const handleEditVilla = (villaId) => {
    setEditingVillaId(villaId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingVillaId(null);
  };

  const handleVillaUpdated = () => {
    fetchVillas(); // Refresh the villa list
  };

  const handleAssignVilla = (villa) => {
    setSelectedVillaForAssignment(villa);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    fetchVillas(); // Refresh the villa list
    setIsAssignModalOpen(false);
    setSelectedVillaForAssignment(null);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort villas
  const filteredVillas = villas
    .filter(
      (villa) =>
        (villa.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          villa.Address?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.yearOfCreation) - new Date(a.yearOfCreation);
      if (sortBy === "oldest") return new Date(a.yearOfCreation) - new Date(b.yearOfCreation);
      if (sortBy === "priceHigh") return b.price - a.price;
      if (sortBy === "priceLow") return a.price - b.price;
      return 0;
    });

  return (
    <div className=" mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Luxury Villas
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200 transform hover:-translate-y-1 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add New Villa
        </button>
      </div>

      {/* Filters Component */}
      <VillaFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
      )}

      {/* Villas Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {filteredVillas.map((villa) => (
            <VillaCard
              key={villa.villasId}
              villa={villa}
              onEdit={() => handleEditVilla(villa.villasId)}
              onDelete={() => openDeleteModal(villa)}
              onAssign={() => handleAssignVilla(villa)}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredVillas.length === 0 && villas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No villas found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && villas.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No villas yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first villa
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Villa
          </button>
        </div>
      )}

      {/* Add Villa Modal */}
      <AddVillaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVillaAdded={fetchVillas}
      />

      {/* Edit Villa Modal */}
      <EditVillaModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onVillaUpdated={handleVillaUpdated}
        villaId={editingVillaId}
      />

      {/* Assign Villa Modal */}
      <AssignVillaModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedVillaForAssignment(null);
        }}
        villa={selectedVillaForAssignment}
        onAssignSuccess={handleAssignSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, villaId: null, villaName: '' })}
        onConfirm={() => handleDeleteVilla(deleteModal.villaId)}
        title="Delete Villa"
        message={`Are you sure you want to delete "${deleteModal.villaName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default VillasPage;
