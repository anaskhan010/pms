import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import adminApiService from "../../services/adminApiService";
import ejari from "../../assets/ejari.jpg";

const ApartmentDetailsPage = () => {
  const { buildingId, apartmentId } = useParams();
  const [apartment, setApartment] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Default apartment images (fallback when no images are available)
  const defaultApartmentImages = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
  ];

  // Fetch apartment details from API
  const fetchApartmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApiService.getApartment(apartmentId);

      if (response.success) {
        const apartmentData = response.data;

        // Map API response to frontend structure
        const mappedApartment = {
          id: apartmentData.apartmentId,
          number: apartmentData.apartmentId.toString(),
          building: parseInt(buildingId),
          floor: apartmentData.floorId,
          bedrooms: apartmentData.bedrooms,
          bathrooms: apartmentData.bathrooms,
          area: `${apartmentData.length * apartmentData.width} sq ft`,
          rent: `$${apartmentData.rentPrice}`,
          status: apartmentData.status === 'occupied' ? 'Rented' : 'Vacant',
          tenantId: apartmentData.tenantId || null,
          description: apartmentData.description || '',
          amenities: apartmentData.amenities || [],
          images: apartmentData.images && apartmentData.images.length > 0
            ? apartmentData.images.map(img => `http://localhost:5000${img.imageUrl}`)
            : defaultApartmentImages,
        };

        setApartment(mappedApartment);

        // If apartment is rented and has a tenant, fetch tenant details and payment data
        if (mappedApartment.status === 'Rented' && mappedApartment.tenantId) {
          await Promise.all([
            fetchTenantDetails(mappedApartment.tenantId),
            fetchPaymentData(mappedApartment.tenantId)
          ]);
        }
      } else {
        setError(response.error || 'Failed to fetch apartment details');
      }
    } catch (err) {
      console.error('Error fetching apartment details:', err);
      setError('An unexpected error occurred while fetching apartment details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenant details
  const fetchTenantDetails = async (tenantId) => {
    try {
      const response = await adminApiService.getTenant(tenantId);

      if (response.success) {
        const tenantData = response.data;

        // Map tenant data to frontend structure
        const mappedTenant = {
          id: tenantData.tenantId,
          name: `${tenantData.firstName} ${tenantData.lastName}`,
          email: tenantData.email,
          phone: tenantData.phoneNumber,
          nationality: tenantData.nationality,
          occupation: tenantData.occupation,
          contractStart: tenantData.contractStartDate,
          contractEnd: tenantData.contractEndDate,
          ejariNumber: tenantData.registrationNumber,
          ejariExpiry: tenantData.registrationExpiry,
          ejariDocument: ejari, // Default document
          payments: [] // Will be populated from payment API
        };

        setTenant(mappedTenant);
      } else {
        console.error('Error fetching tenant details:', response.error);
      }
    } catch (err) {
      console.error('Error fetching tenant details:', err);
    }
  };

  // Fetch payment data for tenant
  const fetchPaymentData = async (tenantId) => {
    try {
      // Fetch payment statistics and recent payments
      const [statsResponse, paymentsResponse] = await Promise.all([
        adminApiService.getTenantPaymentStats(tenantId),
        adminApiService.getPayments({ tenant_id: tenantId, limit: 12 }) // Last 12 payments
      ]);

      if (statsResponse.success) {
        setPaymentStats(statsResponse.data);
      }

      if (paymentsResponse.success) {
        // Map payment data to frontend structure
        const mappedPayments = paymentsResponse.data.map(payment => ({
          id: payment.payment_id,
          date: payment.payment_date,
          amount: payment.amount,
          method: payment.payment_method,
          status: payment.payment_status || 'Completed',
          type: payment.is_advance_payment ? 'Advance' : 'Regular',
          invoiceId: payment.invoice_id,
          description: payment.description || `Rent Payment - ${new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        }));
        setPayments(mappedPayments);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
    }
  };



  useEffect(() => {
    fetchApartmentDetails();
  }, [apartmentId, buildingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button
          onClick={fetchApartmentDetails}
          className="ml-4 text-red-800 underline hover:text-red-900"
        >
          Try Again
        </button>
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
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium text-green-600">{apartment.rent}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        apartment.status === "Rented"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {apartment.status}
                    </span>
                  </div>
                  {apartment.status === "Rented" && tenant && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Current Tenant</p>
                      <p className="font-medium text-blue-600">{tenant.name}</p>
                      <p className="text-xs text-gray-400">{tenant.email} • {tenant.phone}</p>
                    </div>
                  )}
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
        {activeTab === "payments" && apartment.status === "Rented" && tenant && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Payment History
              </h2>
              {paymentStats && (
                <div className="flex space-x-4 text-sm">
                  <div className="bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-blue-600 font-medium">
                      Total Paid: ${paymentStats.statistics?.total_paid || 0}
                    </span>
                  </div>
                  <div className="bg-green-50 px-3 py-2 rounded-lg">
                    <span className="text-green-600 font-medium">
                      This Year: ${paymentStats.statistics?.year_total || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading payment data...</p>
              </div>
            )}

            {!loading && payments.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
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
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.type === 'Advance'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {payment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
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
            ) : !loading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No payment history available</p>
                <p className="text-gray-400 text-sm mt-2">Payment records will appear here once transactions are made</p>
              </div>
            )}

            {/* Payment Summary */}
            {paymentStats && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Payment Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${paymentStats.statistics?.total_paid?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">This Year</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${paymentStats.statistics?.year_total?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Average Monthly</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${paymentStats.statistics?.average_monthly?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Payment Count</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {paymentStats.statistics?.payment_count || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment History Tab - Vacant Apartment */}
        {activeTab === "payments" && apartment.status !== "Rented" && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Apartment is Vacant</h3>
            <p className="text-gray-500">No payment history available for vacant apartments.</p>
            <p className="text-gray-400 text-sm mt-2">Payment records will appear here once the apartment is rented.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentDetailsPage;
