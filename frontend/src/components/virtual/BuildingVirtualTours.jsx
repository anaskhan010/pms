import { useState, useEffect } from "react";
import VideoModal from "./VideoModal";
import faisal from "../../assets/faisal.jpg";

const BuildingVirtualTours = () => {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  // Sample building data
  const buildingsData = [
    {
      id: 1,
      name: "Al Faisaliah Residences",
      address: "King Fahd Road, Riyadh",
      image: faisal,
    },
    {
      id: 2,
      name: "Kingdom Tower Apartments",
      address: "Al Olaya District, Riyadh",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      id: 3,
      name: "Red Sea Residence",
      address: "Corniche Road, Jeddah",
      image:
        "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
  ];

  // Sample floor data generator
  const generateFloors = (buildingId) => {
    const totalFloors = buildingId === 1 ? 25 : buildingId === 2 ? 18 : 12;
    const floors = [];
    for (let i = 1; i <= totalFloors; i++) {
      floors.push({
        id: i,
        number: i,
        buildingId: buildingId,
      });
    }
    return floors;
  };

  // Sample apartment data generator
  const generateApartments = (buildingId, floorNumber) => {
    const apartmentsPerFloor = Math.floor(Math.random() * 3) + 4; // 4-6 apartments per floor
    const apartments = [];

    for (let j = 1; j <= apartmentsPerFloor; j++) {
      const apartmentNumber = `${floorNumber}${String(j).padStart(2, "0")}`;
      const bedrooms = Math.floor(Math.random() * 3) + 1;
      const status = Math.random() > 0.3 ? "Occupied" : "Vacant";

      apartments.push({
        id: parseInt(`${buildingId}${floorNumber}${j}`),
        number: apartmentNumber,
        bedrooms,
        bathrooms: bedrooms,
        area: `${bedrooms * 500 + Math.floor(Math.random() * 300)} sq ft`,
        status,
        // Use the same video for all apartments
        videoUrl:
          "https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4",
      });
    }

    return apartments;
  };

  // Load buildings on component mount
  useEffect(() => {
    setBuildings(buildingsData);
  }, []);

  // Handle building selection
  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setSelectedApartment(null);
    setShowVideo(false);

    // Generate floors for the selected building
    const generatedFloors = generateFloors(building.id);
    setFloors(generatedFloors);
  };

  // Handle floor selection
  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    setSelectedApartment(null);
    setShowVideo(false);

    // Generate apartments for the selected floor
    const generatedApartments = generateApartments(
      selectedBuilding.id,
      floor.number
    );
    setApartments(generatedApartments);
  };

  // Handle apartment selection
  const handleApartmentSelect = (apartment) => {
    setSelectedApartment(apartment);
    setShowVideo(true);
  };

  // Close video modal
  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  return (
    <div>
      {/* Building Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Select a Building
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div
              key={building.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 ${
                selectedBuilding?.id === building.id
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              onClick={() => handleBuildingSelect(building)}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={building.image}
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {building.name}
                </h3>
                <p className="text-gray-600">{building.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floor Selection */}
      {selectedBuilding && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Select a Floor in {selectedBuilding.name}
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {floors.map((floor) => (
              <button
                key={floor.id}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedFloor?.id === floor.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handleFloorSelect(floor)}
              >
                Floor {floor.number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apartment Selection */}
      {selectedFloor && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Select an Apartment on Floor {selectedFloor.number}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {apartments.map((apartment) => (
              <div
                key={apartment.id}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedApartment?.id === apartment.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => handleApartmentSelect(apartment)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Apartment {apartment.number}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      apartment.status === "Occupied"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {apartment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    {apartment.bedrooms} Bed | {apartment.bathrooms} Bath
                  </p>
                  <p>{apartment.area}</p>
                </div>
                <div className="mt-3 flex justify-center">
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View Virtual Tour
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && selectedApartment && (
        <VideoModal
          title={`Virtual Tour - Apartment ${selectedApartment.number}`}
          videoUrl={selectedApartment.videoUrl}
          onClose={handleCloseVideo}
          details={[
            { label: "Apartment Number", value: selectedApartment.number },
            { label: "Size", value: selectedApartment.area },
            { label: "Bedrooms", value: selectedApartment.bedrooms },
            { label: "Bathrooms", value: selectedApartment.bathrooms }
          ]}
        />
      )}
    </div>
  );
};

export default BuildingVirtualTours;
