import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import adminApiService from "../../services/adminApiService";

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
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${data.images[0].imageUrl}`
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
          number: a.apartmentId.toString(),
          bedrooms: a.bedrooms,
          bathrooms: a.bathrooms,
          area: `${a.length} X ${a.width} sq ft`,
          rent: `$${a.rentPrice}`,
          status: a.status,
          description: a.description || '',
          amenities: Array.isArray(a.amenities) ? a.amenities : [],
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {building.image && (
          <div className="md:flex-shrink-0">
            <img src={building.image} alt={building.name} className="h-48 w-full object-cover md:w-48" />
          </div>
        )}
        <div className="p-8">
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
            <div><p className="text-sm text-gray-500">Units</p><p className="text-lg font-semibold">{building.units}</p></div>
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
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full`} >{apartment.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><p className="text-sm text-gray-500">Bedrooms</p><p className="font-medium">{apartment.bedrooms}</p></div>
                      <div><p className="text-sm text-gray-500">Bathrooms</p><p className="font-medium">{apartment.bathrooms}</p></div>
                      <div><p className="text-sm text-gray-500">Area</p><p className="font-medium">{apartment.area}</p></div>
                      <div><p className="text-sm text-gray-500">Rent</p><p className="font-medium">{apartment.rent}</p></div>
                    </div>

                    {apartment.description && (
                      <p className="text-gray-700 mb-4">{apartment.description}</p>
                    )}

                    {apartment.amenities.length > 0 && (
                      <ul className="list-disc list-inside mb-4">
                        {apartment.amenities.map((amenity, idx) => (
                          <li key={idx}>{amenity}</li>
                        ))}
                      </ul>
                    )}

                    <Link to={`/admin/buildings/${building.id}/apartments/${apartment.id}`} className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No apartments found on this floor</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default BuildingDetailsPage;



// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import adminApiService from "../../services/adminApiService";
// import faisal from "../../assets/faisal.jpg";

// const BuildingDetailsPage = () => {
//   const { id } = useParams();
//   const [building, setBuilding] = useState(null);
//   const [floors, setFloors] = useState([]);
//   const [apartments, setApartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingFloors, setLoadingFloors] = useState(false);
//   const [loadingApartments, setLoadingApartments] = useState(false);
//   const [error, setError] = useState(null);
//   const [activeFloor, setActiveFloor] = useState(null);

//   // Fetch building details
//   const fetchBuildingDetails = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Get specific building by ID
//       const response = await adminApiService.getBuildingById(id);

//       if (response.success) {
//         const buildingData = response.data;
//         setBuilding({
//           id: buildingData.buildingId,
//           name: buildingData.buildingName,
//           address: buildingData.buildingAddress,
//           units: buildingData.totalApartments || 0,
//           floors: buildingData.totalFloors || 0,
//           yearBuilt: new Date(buildingData.buildingCreatedDate).getFullYear() || 2020,
//           status: "Operational",
//           image: buildingData.images && buildingData.images.length > 0
//             ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${buildingData.images[0].imageUrl}`
//             : "", // Default image if no building images
//           images: buildingData.images || []
//         });

//         // Fetch floors for this building
//         await fetchFloors(buildingData.buildingId);
//       } else {
//         setError(response.error || 'Failed to fetch building details');
//       }
//     } catch (err) {
//       console.error('Error fetching building details:', err);
//       setError('An unexpected error occurred while fetching building details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch floors for the building
//   const fetchFloors = async (buildingId) => {
//     try {
//       setLoadingFloors(true);
//       const response = await adminApiService.getFloorsByBuilding(buildingId);

//       if (response.success) {
//         const mappedFloors = response.data.map(floor => ({
//           floorNumber: floor.floorId,
//           floorName: floor.floorName,
//           floorId: floor.floorId,
//           apartments: [] // Will be loaded when floor is selected
//         }));
//         setFloors(mappedFloors);

//         // Set the first floor as active by default
//         if (mappedFloors.length > 0) {
//           setActiveFloor(mappedFloors[0]);
//           await fetchApartments(mappedFloors[0].floorId);
//         }
//       } else {
//         console.error('Error loading floors:', response.error);
//       }
//     } catch (err) {
//       console.error('Error fetching floors:', err);
//     } finally {
//       setLoadingFloors(false);
//     }
//   };

//   // Fetch apartments for a specific floor
//   const fetchApartments = async (floorId) => {
//     try {
//       setLoadingApartments(true);
//       const response = await adminApiService.getApartmentsByFloor(floorId);

//       if (response.success) {
//         const mappedApartments = response.data.map(apartment => ({
//           id: apartment.apartmentId,
//           number: apartment.apartmentId.toString(),
//           bedrooms: apartment.bedrooms,
//           bathrooms: apartment.bathrooms,
//           area: `${apartment.bedrooms * 500} sq ft`, // Estimated area
//           rent: `$${apartment.rentPrice}`,
//           status: apartment.status === 'Available' ? 'Vacant' : 'Rented',
//           tenantId: apartment.status === 'Occupied' ? apartment.tenantId : null
//         }));
//         setApartments(mappedApartments);

//         // Update the active floor with apartments
//         setActiveFloor(prev => ({
//           ...prev,
//           apartments: mappedApartments
//         }));
//       } else {
//         console.error('Error loading apartments:', response.error);
//         setApartments([]);
//       }
//     } catch (err) {
//       console.error('Error fetching apartments:', err);
//       setApartments([]);
//     } finally {
//       setLoadingApartments(false);
//     }
//   };

//   // Handle floor selection
//   const handleFloorSelect = async (floor) => {
//     setActiveFloor(floor);
//     await fetchApartments(floor.floorId);
//   };

//   useEffect(() => {
//     fetchBuildingDetails();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//         {error}
//         <button
//           onClick={fetchBuildingDetails}
//           className="ml-4 text-red-800 underline hover:text-red-900"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!building) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//         Building not found
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-6">
//         <Link
//           to="/admin/buildings"
//           className="text-blue-600 hover:text-blue-800 flex items-center"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 mr-1"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M10 19l-7-7m0 0l7-7m-7 7h18"
//             />
//           </svg>
//           Back to Buildings
//         </Link>
//       </div>

//       {/* Building Details */}
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//         <div className="md:flex">
//           <div className="md:flex-shrink-0">
//             <img
//               className="h-48 w-full object-cover md:w-48"
//               src={building.image}
//               alt={building.name}
//             />
//           </div>
//           <div className="p-8">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800 mb-2">
//                   {building.name}
//                 </h1>
//                 <p className="text-gray-600 mb-4">{building.address}</p>
//               </div>
//               <span
//                 className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
//                   building.status === "Operational"
//                     ? "bg-green-100 text-green-800"
//                     : "bg-yellow-100 text-yellow-800"
//                 }`}
//               >
//                 {building.status}
//               </span>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//               <div>
//                 <p className="text-sm text-gray-500">Total Units</p>
//                 <p className="text-lg font-semibold">{building.units}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Floors</p>
//                 <p className="text-lg font-semibold">{building.floors}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Year Built</p>
//                 <p className="text-lg font-semibold">{building.yearBuilt}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Occupancy Rate</p>
//                 <p className="text-lg font-semibold">
//                   {Math.floor(Math.random() * 30) + 70}%
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Floor Selection */}
//       <div className="mb-6">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Select Floor</h2>
//         {loadingFloors ? (
//           <div className="flex items-center justify-center py-4">
//             <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
//             <span className="ml-2 text-gray-600">Loading floors...</span>
//           </div>
//         ) : (
//           <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
//             {floors.map((floor) => (
//               <button
//                 key={floor.floorId}
//                 onClick={() => handleFloorSelect(floor)}
//                 disabled={loadingApartments}
//                 className={`px-4 py-2 rounded-md transition-colors ${
//                   activeFloor && activeFloor.floorId === floor.floorId
//                     ? "bg-teal-600 text-white"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 } ${loadingApartments ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 {floor.floorName || `Floor ${floor.floorNumber}`}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Apartments on Selected Floor */}
//       {activeFloor && (
//         <div>
//           <h2 className="text-xl font-bold text-gray-800 mb-4">
//             Apartments on {activeFloor.floorName || `Floor ${activeFloor.floorNumber}`}
//           </h2>

//           {loadingApartments ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
//               <span className="ml-3 text-gray-600">Loading apartments...</span>
//             </div>
//           ) : apartments.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               No apartments found on this floor
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {apartments.map((apartment) => (
//               <div
//                 key={apartment.id}
//                 className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
//               >
//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <h3 className="text-lg font-bold text-gray-800">
//                       Apartment {apartment.number}
//                     </h3>
//                     <span
//                       className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         apartment.status === "Rented"
//                           ? "bg-green-100 text-green-800"
//                           : "bg-blue-100 text-blue-800"
//                       }`}
//                     >
//                       {apartment.status}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm text-gray-500">Bedrooms</p>
//                       <p className="font-medium">{apartment.bedrooms}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Bathrooms</p>
//                       <p className="font-medium">{apartment.bathrooms}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Area</p>
//                       <p className="font-medium">{apartment.area}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Rent</p>
//                       <p className="font-medium">{apartment.rent}</p>
//                     </div>
//                   </div>
//                   <Link
//                     to={`/admin/buildings/${building.id}/apartments/${apartment.id}`}
//                     className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
//                   >
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BuildingDetailsPage;
