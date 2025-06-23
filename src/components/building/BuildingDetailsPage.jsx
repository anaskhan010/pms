import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import faisal from "../../assets/faisal.jpg";

const BuildingDetailsPage = () => {
  const { id } = useParams();
  const [building, setBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState(null);

  // Sample building data
  const buildingsData = [
    {
      id: 1,
      name: "Al Faisaliah Residences",
      address: "King Fahd Road, Riyadh",
      units: 120,
      floors: 25,
      yearBuilt: 2015,
      status: "Operational",
      image: faisal,
    },
    {
      id: 2,
      name: "Kingdom Tower Apartments",
      address: "Al Olaya District, Riyadh",
      units: 85,
      floors: 18,
      yearBuilt: 2018,
      status: "Operational",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      id: 3,
      name: "Red Sea Residence",
      address: "Corniche Road, Jeddah",
      units: 60,
      floors: 12,
      yearBuilt: 2020,
      status: "Under Maintenance",
      image:
        "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
  ];

  // Sample floor data generator
  const generateFloors = (buildingId, totalFloors) => {
    const floors = [];
    for (let i = 1; i <= totalFloors; i++) {
      // Generate 4-8 apartments per floor
      const apartmentsPerFloor = Math.floor(Math.random() * 5) + 4;
      const apartments = [];

      for (let j = 1; j <= apartmentsPerFloor; j++) {
        const apartmentNumber = `${i}${String(j).padStart(2, "0")}`;
        const bedrooms = Math.floor(Math.random() * 3) + 1;
        const status = Math.random() > 0.3 ? "Rented" : "Vacant";

        apartments.push({
          id: parseInt(`${buildingId}${i}${j}`),
          number: apartmentNumber,
          bedrooms,
          bathrooms: bedrooms,
          area: `${bedrooms * 500 + Math.floor(Math.random() * 300)} sq ft`,
          rent: `$${bedrooms * 1000 + Math.floor(Math.random() * 500)}`,
          status,
          tenantId:
            status === "Rented" ? Math.floor(Math.random() * 10) + 1 : null,
        });
      }

      floors.push({
        floorNumber: i,
        apartments,
      });
    }
    return floors;
  };

  useEffect(() => {
    // Simulate API call to fetch building details
    const fetchBuildingDetails = () => {
      setLoading(true);

      // Find building by ID
      const foundBuilding = buildingsData.find((b) => b.id === parseInt(id));

      if (foundBuilding) {
        setBuilding(foundBuilding);

        // Generate floors and apartments for this building
        const generatedFloors = generateFloors(
          foundBuilding.id,
          foundBuilding.floors
        );
        setFloors(generatedFloors);

        // Set the first floor as active by default
        if (generatedFloors.length > 0) {
          setActiveFloor(generatedFloors[0]);
        }
      }

      setLoading(false);
    };

    fetchBuildingDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Building not found
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/buildings"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Buildings
        </Link>
      </div>

      {/* Building Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48"
              src={building.image}
              alt={building.name}
            />
          </div>
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {building.name}
                </h1>
                <p className="text-gray-600 mb-4">{building.address}</p>
              </div>
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  building.status === "Operational"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {building.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-lg font-semibold">{building.units}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Floors</p>
                <p className="text-lg font-semibold">{building.floors}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Built</p>
                <p className="text-lg font-semibold">{building.yearBuilt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupancy Rate</p>
                <p className="text-lg font-semibold">
                  {Math.floor(Math.random() * 30) + 70}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select Floor</h2>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {floors.map((floor) => (
            <button
              key={floor.floorNumber}
              onClick={() => setActiveFloor(floor)}
              className={`px-4 py-2 rounded-md ${
                activeFloor && activeFloor.floorNumber === floor.floorNumber
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Floor {floor.floorNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Apartments on Selected Floor */}
      {activeFloor && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Apartments on Floor {activeFloor.floorNumber}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFloor.apartments.map((apartment) => (
              <div
                key={apartment.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Apartment {apartment.number}
                    </h3>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        apartment.status === "Rented"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {apartment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-medium">{apartment.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-medium">{apartment.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-medium">{apartment.area}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rent</p>
                      <p className="font-medium">{apartment.rent}</p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/buildings/${building.id}/apartments/${apartment.id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingDetailsPage;
