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
import PageBanner from "../common/PageBanner";
import { useAuth } from "../../contexts/AuthContext";
import { PermissionButton } from "../auth/PermissionGuard";

const VillasPage = () => {
  const { user } = useAuth();
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
    <div className="mx-auto px-4 space-y-6">
      {/* Page Banner */}
      <PageBanner
        title="Luxury Villa Management"
        subtitle="Manage premium villas with comprehensive property controls"
        icon={
          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
        stats={[
          {
            value: villas.length,
            label: "Total Villas",
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          },
          {
            value: filteredVillas.length,
            label: "Filtered Results",
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" /></svg>
          },
          {
            value: user?.role === 'owner' ? 'Assigned Villas' : 'All Villas',
            label: "Access Level",
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          }
        ]}
        actions={[
          {
            label: "Add Villa",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
            onClick: () => setIsAddModalOpen(true),
            variant: 'primary',
            resource: 'villas',
            action: 'create',
            tooltipText: "You don't have permission to create villas"
          }
        ]}
        gradient="from-purple-900 via-purple-800 to-slate-900"
      />

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
