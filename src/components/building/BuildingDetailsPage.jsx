import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import adminApiService from "../../services/adminApiService";
import AssignApartmentModal from "../apartment/AssignApartmentModal";
import notificationService from "../../services/notificationService";

const BuildingDetailsPage = () => {
  const { id } = useParams();
  const [building, setBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [error, setError] = useState(null);
  const [activeFloor, setActiveFloor] = useState(null);

  // Assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedApartmentForAssignment, setSelectedApartmentForAssignment] = useState(null);

  // Fetch building details
  const fetchBuildingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApiService.getBuildingById(id);
      console.log(response,"-----check building response-------")

      if (response.success) {
        const data = response.data;
        setBuilding({
          id: data.buildingId,
          name: data.buildingName,
          address: data.buildingAddress,
          units: data.totalApartments || 0,
          floors: data.totalFloors || 0,
          yearBuilt: data.buildingCreatedDate
            ? new Date(data.buildingCreatedDate).getFullYear()
            : null,
          status: data.status,
          description: data.description || '',
          image: data.images && data.images.length > 0
            ? `${import.meta.env.VITE_APP_IMAGE_URL}${data.images[0].imageUrl}`
            : null,
        });
        await fetchFloors(data.buildingId);
      } else {
        setError(response.error || 'Failed to fetch building details');
      }
    } catch (err) {
      console.error('Error fetching building details:', err);
      setError('An unexpected error occurred while fetching building details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch floors
  const fetchFloors = async (buildingId) => {
    try {
      setLoadingFloors(true);
      const response = await adminApiService.getFloorsByBuilding(buildingId);
      if (response.success) {
        const mapped = response.data.map(f => ({
          floorId: f.floorId,
          floorName: f.floorName || `Floor ${f.floorId}`,
        }));
        setFloors(mapped);
        if (mapped.length > 0) {
          setActiveFloor(mapped[0]);
          await fetchApartments(mapped[0].floorId);
        }
      }
    } catch (err) {
      console.error('Error loading floors:', err);
    } finally {
      setLoadingFloors(false);
    }
  };

  // Fetch apartments
  const fetchApartments = async (floorId) => {
    try {
      setLoadingApartments(true);
      const response = await adminApiService.getApartmentsByFloor(floorId);

      console.log(response,"-----check apartment response-------")
      if (response.success) {
        const mapped = response.data.map(a => ({
          id: a.apartmentId,
          apartmentId: a.apartmentId, // Add this for the assignment modal
          number: a.apartmentId.toString(),
          bedrooms: a.bedrooms,
          bathrooms: a.bathrooms,
          area: `${a.length} X ${a.width} sq ft`,
          rent: `AED ${a.rentPrice}`,
          rentPrice: a.rentPrice, // Add this for the assignment modal
          status: a.status,
          description: a.description || '',
          amenities: Array.isArray(a.amenities) ? a.amenities : [],
          floor: a.floorName || `Floor ${a.floorId}`, // Add floor info for the modal
        }));
        setApartments(mapped);
      } else {
        setApartments([]);
      }
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setApartments([]);
    } finally {
      setLoadingApartments(false);
    }
  };

  const handleFloorSelect = async (floor) => {
    setActiveFloor(floor);
    await fetchApartments(floor.floorId);
  };

  // Handle apartment assignment
  const handleAssignApartment = (apartment) => {
    console.log('Selected apartment for assignment:', apartment);
    setSelectedApartmentForAssignment(apartment);
    setIsAssignModalOpen(true);
  };

  const handleAssignmentSuccess = () => {
    // Refresh apartments list to show updated status
    if (activeFloor) {
      fetchApartments(activeFloor.floorId);
    }
    notificationService.success('Apartment assigned successfully!');
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedApartmentForAssignment(null);
  };

  useEffect(() => {
    fetchBuildingDetails();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div></div>;
  if (error) return (<div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">{error} <button onClick={fetchBuildingDetails} className="ml-4 underline">Try Again</button></div>);
  if (!building) return <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">Building not found</div>;

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/buildings" className="text-blue-600 hover:text-blue-800 flex items-center">
          <span className="ml-1">Back to Buildings</span>
        </Link>
      </div>

      {/* Building Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 md:flex">
        {/* Fixed Image Section */}
        <div className="md:flex-shrink-0 md:w-48 w-full h-56">
          {building.image && building.image.length > 0 ? (
            <img
              src={building.image}
              alt={building.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-8 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{building.name}</h1>
              <p className="text-gray-600 mb-4">{building.address}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${building.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{building.status}</span>
          </div>

          {building.description && (
            <p className="mt-4 text-gray-700">{building.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div><p className="text-sm text-gray-500">Apartments</p><p className="text-lg font-semibold">{building.units}</p></div>
            <div><p className="text-sm text-gray-500">Floors</p><p className="text-lg font-semibold">{building.floors}</p></div>
            <div><p className="text-sm text-gray-500">Year Built</p><p className="text-lg font-semibold">{building.yearBuilt || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-500">Occupancy Rate</p><p className="text-lg font-semibold">{Math.floor(Math.random() * 30) + 70}%</p></div>
          </div>
        </div>
      </div>

      {/* Floor Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select Floor</h2>
        {loadingFloors ? (
          <div className="flex items-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div><span className="ml-2">Loading floors...</span></div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {floors.map(floor => (
              <button key={floor.floorId} onClick={() => handleFloorSelect(floor)} disabled={loadingApartments}
                className={`px-4 py-2 rounded-md ${activeFloor?.floorId === floor.floorId ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{floor.floorName}</button>
            ))}
          </div>
        )}
      </div>

      {/* Apartments */}
      {activeFloor && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Apartments on {activeFloor.floorName}</h2>
          {loadingApartments ? (
            <div className="flex items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div><span className="ml-3">Loading apartments...</span></div>
          ) : (
            apartments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apartments.map(apartment => (
                  <div key={apartment.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-bold">Apartment {apartment.number}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        apartment.status === 'Rented'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {apartment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><p className="text-sm text-gray-500">Bedrooms</p><p className="font-medium">{apartment.bedrooms}</p></div>
                      <div><p className="text-sm text-gray-500">Bathrooms</p><p className="font-medium">{apartment.bathrooms}</p></div>
                      <div><p className="text-sm text-gray-500">Area</p><p className="font-medium">{apartment.area}</p></div>
                      <div><p className="text-sm text-gray-500">Rent</p><p className="font-medium">{apartment.rent}</p></div>
                    </div>


                    {apartment.amenities.length > 0 && (
                      <ul className="list-disc list-inside mb-4">
                        {apartment.amenities.map((amenity, idx) => (
                          <li key={idx}>{amenity}</li>
                        ))}
                      </ul>
                    )}

                    <div className="space-y-2">
                      <Link
                        to={`/admin/buildings/${building.id}/apartments/${apartment.id}`}
                        className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                      >
                        View Details
                      </Link>

                      {apartment.status === 'Vacant' ? (
                        <button
                          onClick={() => handleAssignApartment(apartment)}
                          className="w-full text-center bg-teal-600 hover:bg-teal-700 text-white py-2 rounded transition-colors"
                        >
                          Assign Apartment
                        </button>
                      ) : (
                        <button
                          className="w-full text-center bg-gray-400 text-white py-2 rounded cursor-not-allowed"
                          disabled
                        >
                          Currently Rented
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No apartments found on this floor</p>
            )
          )}
        </div>
      )}

      {/* Assignment Modal */}
      <AssignApartmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        apartment={selectedApartmentForAssignment}
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    </div>
  );
};

export default BuildingDetailsPage;

