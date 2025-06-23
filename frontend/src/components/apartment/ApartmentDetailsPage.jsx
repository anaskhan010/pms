import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ejari from "../../assets/ejari.jpg";

const ApartmentDetailsPage = () => {
  const { buildingId, apartmentId } = useParams();
  const [apartment, setApartment] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  // Sample apartment images
  const apartmentImages = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
  ];

  // Sample tenant data
  const tenantsData = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+966 50 123 4567",
      nationality: "Saudi Arabia",
      occupation: "Software Engineer",
      contractStart: "2023-01-15",
      contractEnd: "2024-01-14",
      ejariNumber: "IJ-2023-12345",
      ejariExpiry: "2024-01-14",
      ejariDocument: ejari,
      payments: [
        {
          id: 1,
          date: "2023-01-15",
          amount: "$2,500",
          status: "Paid",
          type: "First Month Rent",
        },
        {
          id: 2,
          date: "2023-02-15",
          amount: "$2,500",
          status: "Paid",
          type: "Monthly Rent",
        },
        {
          id: 3,
          date: "2023-03-15",
          amount: "$2,500",
          status: "Paid",
          type: "Monthly Rent",
        },
        {
          id: 4,
          date: "2023-04-15",
          amount: "$2,500",
          status: "Paid",
          type: "Monthly Rent",
        },
        {
          id: 5,
          date: "2023-05-15",
          amount: "$2,500",
          status: "Paid",
          type: "Monthly Rent",
        },
        {
          id: 6,
          date: "2023-06-15",
          amount: "$2,500",
          status: "Paid",
          type: "Monthly Rent",
        },
        {
          id: 7,
          date: "2023-07-15",
          amount: "$2,500",
          status: "Pending",
          type: "Monthly Rent",
        },
      ],
    },
    // {
    //   id: 2,
    //   name: "Jane Smith",
    //   email: "jane.smith@example.com",
    //   phone: "+966 55 987 6543",
    //   nationality: "United Arab Emirates",
    //   occupation: "Marketing Manager",
    //   contractStart: "2023-02-01",
    //   contractEnd: "2024-01-31",
    //   ejariNumber: "IJ-2023-67890",
    //   ejariExpiry: "2024-01-31",
    //   ejariDocument: ejari,

    //   payments: [
    //     {
    //       id: 1,
    //       date: "2023-02-01",
    //       amount: "$3,200",
    //       status: "Paid",
    //       type: "First Month Rent",
    //     },
    //     {
    //       id: 2,
    //       date: "2023-03-01",
    //       amount: "$3,200",
    //       status: "Paid",
    //       type: "Monthly Rent",
    //     },
    //     {
    //       id: 3,
    //       date: "2023-04-01",
    //       amount: "$3,200",
    //       status: "Paid",
    //       type: "Monthly Rent",
    //     },
    //     {
    //       id: 4,
    //       date: "2023-05-01",
    //       amount: "$3,200",
    //       status: "Paid",
    //       type: "Monthly Rent",
    //     },
    //     {
    //       id: 5,
    //       date: "2023-06-01",
    //       amount: "$3,200",
    //       status: "Pending",
    //       type: "Monthly Rent",
    //     },
    //   ],
    // },
    // Add more tenants as needed
  ];

  // Generate a sample apartment
  const generateApartment = (id) => {
    const apartmentNumber = Math.floor(id / 10) % 100;
    const floorNumber = Math.floor(id / 100) % 100;
    const bedrooms = Math.floor(Math.random() * 3) + 1;
    const status = Math.random() > 0.3 ? "Rented" : "Vacant";

    return {
      id: parseInt(id),
      number: `${floorNumber}${String(apartmentNumber).padStart(2, "0")}`,
      building: parseInt(buildingId),
      floor: floorNumber,
      bedrooms,
      bathrooms: bedrooms,
      area: `${bedrooms * 500 + Math.floor(Math.random() * 300)} sq ft`,
      rent: `$${bedrooms * 1000 + Math.floor(Math.random() * 500)}`,
      status,
      tenantId: status === "Rented" ? Math.floor(Math.random() * 2) + 1 : null,
      description: `Spacious ${bedrooms} bedroom apartment with modern amenities, including a fully equipped kitchen, central air conditioning, and high-speed internet. Located on the ${floorNumber}${getOrdinalSuffix(
        floorNumber
      )} floor with beautiful city views.`,
      amenities: [
        "Central Air Conditioning",
        "High-Speed Internet",
        "Fully Equipped Kitchen",
        "In-unit Washer/Dryer",
        "Balcony",
        "Parking Space",
        bedrooms > 1
          ? "Master Bedroom with En-suite Bathroom"
          : "Spacious Bedroom",
        "Storage Unit",
      ],
      images: apartmentImages,
    };
  };

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  useEffect(() => {
    // Simulate API call to fetch apartment details
    const fetchApartmentDetails = () => {
      setLoading(true);

      // Generate apartment data
      const generatedApartment = generateApartment(apartmentId);
      setApartment(generatedApartment);

      // If apartment is rented, fetch tenant details
      if (
        generatedApartment.status === "Rented" &&
        generatedApartment.tenantId
      ) {
        const tenantData = tenantsData.find(
          (t) => t.id === generatedApartment.tenantId
        );
        setTenant(tenantData);
      }

      setLoading(false);
    };

    fetchApartmentDetails();
  }, [apartmentId, buildingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Apartment not found
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to={`/admin/buildings/${buildingId}`}
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
          Back to Building
        </Link>
      </div>

      {/* Apartment Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="relative h-64">
          <img
            src={apartment.images[0]}
            alt={`Apartment ${apartment.number}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">
                Apartment {apartment.number}
              </h1>
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    apartment.status === "Rented"
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {apartment.status}
                </span>
                <span className="mx-3 text-gray-300">|</span>
                <span>{apartment.bedrooms} Bedroom</span>
                <span className="mx-3 text-gray-300">|</span>
                <span>{apartment.area}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 md:space-x-8 whitespace-nowrap">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Apartment Details
          </button>
          {apartment.status === "Rented" && (
            <button
              onClick={() => setActiveTab("tenant")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tenant"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tenant Information
            </button>
          )}
          {apartment.status === "Rented" && (
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Payment History
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Apartment Details Tab */}
        {activeTab === "details" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Apartment Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Apartment Number</p>
                    <p className="font-medium">{apartment.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium">{apartment.floor}</p>
                  </div>
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
                    <p className="font-medium">{apartment.rent}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`font-medium ${
                        apartment.status === "Rented"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {apartment.status}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Description
                </h2>
                <p className="text-gray-600">{apartment.description}</p>

                <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">
                  Amenities
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {apartment.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Apartment Photos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apartment.images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={image}
                    alt={`Apartment ${apartment.number} - Photo ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tenant Information Tab */}
        {activeTab === "tenant" && tenant && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Tenant Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{tenant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{tenant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="font-medium">{tenant.nationality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium">{tenant.occupation}</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mt-6 mb-4">
                  Contract Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contract Start</p>
                    <p className="font-medium">{tenant.contractStart}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contract End</p>
                    <p className="font-medium">{tenant.contractEnd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium">{apartment.rent}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Ejari Document
                </h3>
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Ejari Number</p>
                      <p className="font-medium">{tenant.ejariNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="font-medium">{tenant.ejariExpiry}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={tenant.ejariDocument}
                      alt="Ejari Document"
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                      Download Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === "payments" && tenant && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Payment History
            </h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenant.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Payment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    $
                    {tenant.payments
                      .filter((p) => p.status === "Paid")
                      .reduce(
                        (sum, p) =>
                          sum +
                          parseInt(p.amount.replace("$", "").replace(",", "")),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    $
                    {tenant.payments
                      .filter((p) => p.status === "Pending")
                      .reduce(
                        (sum, p) =>
                          sum +
                          parseInt(p.amount.replace("$", "").replace(",", "")),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500">Next Payment Due</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tenant.payments.find((p) => p.status === "Pending")
                      ?.date || "No pending payments"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentDetailsPage;
