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
          area: `${apartmentData.length} X ${ apartmentData.width} sq ft`,
          rent: `$${apartmentData.rentPrice}`,
          status: apartmentData.status || 'Vacant',
          tenantId: apartmentData.tenantId || null,
          description: apartmentData.description || '',
          amenities: apartmentData.amenities || [],
          images: apartmentData.images && apartmentData.images.length > 0
            ? apartmentData.images.map(img => `${import.meta.env.VITE_APP_IMAGE_URL}${img.imageUrl}`)
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

      console.log(response,"-----check tenant response-------")

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
          contractStart: tenantData.startDate,
          contractEnd : tenantData.endDate,
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
      // Fetch enhanced payment history and statistics
      const [historyResponse, transactionsResponse] = await Promise.all([
        adminApiService.getTenantPaymentHistory(tenantId, { limit: 12 }),
        adminApiService.getFinancialTransactions({
          tenantId: tenantId,
          apartmentId: apartment?.apartmentId,
          limit: 12
        })
      ]);

      if (historyResponse.success && historyResponse.data) {
        setPaymentStats(historyResponse.data.statistics || {});

        // Map payment history to frontend structure
        const paymentHistory = historyResponse.data.paymentHistory || [];
        const mappedPayments = paymentHistory.map(payment => ({
          id: payment.paymentHistoryId,
          date: payment.formattedPaymentDate || payment.paymentDate,
          amount: payment.totalPaid,
          rentAmount: payment.rentAmount,
          lateFee: payment.lateFee,
          method: payment.paymentMethod,
          status: payment.status === 'On Time' ? 'Completed' : payment.status,
          type: 'Rent Payment',
          month: payment.monthYearDisplay || payment.formattedPaymentMonth,
          description: `Monthly rent payment - ${payment.monthYearDisplay || payment.formattedPaymentMonth}`,
          referenceNumber: payment.referenceNumber,
          receiptPath: payment.receiptPath
        }));
        setPayments(mappedPayments);
      }

      // Also fetch recent financial transactions for additional context
      if (transactionsResponse.success && transactionsResponse.data) {
        const transactions = transactionsResponse.data || [];

        // Add non-rent transactions to payments list
        const otherTransactions = transactions
          .filter(t => t.transactionType !== 'Rent Payment')
          .map(transaction => ({
            id: transaction.transactionId,
            date: transaction.transactionDate,
            amount: transaction.amount,
            method: transaction.paymentMethod,
            status: transaction.status,
            type: transaction.transactionType,
            description: transaction.description || transaction.transactionType,
            referenceNumber: transaction.referenceNumber,
            receiptPath: transaction.receiptPath
          }));

        // Combine rent payments and other transactions
        setPayments(prev => [...prev, ...otherTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
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
                      Total Paid: AED {paymentStats.totalAmountPaid?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="bg-green-50 px-3 py-2 rounded-lg">
                    <span className="text-green-600 font-medium">
                      On Time: {paymentStats.onTimePayments || 0}/{paymentStats.totalPayments || 0}
                    </span>
                  </div>
                  <div className="bg-yellow-50 px-3 py-2 rounded-lg">
                    <span className="text-yellow-600 font-medium">
                      Late Fees: AED {paymentStats.totalLateFees?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="bg-purple-50 px-3 py-2 rounded-lg">
                    <span className="text-purple-600 font-medium">
                      Reliability: {paymentStats.paymentReliability || 0}%
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
                            <div>
                              <div className="font-medium">{payment.description}</div>
                              {payment.month && (
                                <div className="text-xs text-gray-500">
                                  Period: {payment.month}
                                </div>
                              )}
                              {payment.lateFee > 0 && (
                                <div className="text-xs text-red-500">
                                  Late Fee: AED {payment.lateFee?.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div>
                              <div>AED {payment.amount?.toLocaleString()}</div>
                              {payment.rentAmount && payment.rentAmount !== payment.amount && (
                                <div className="text-xs text-gray-500">
                                  Rent: AED {payment.rentAmount?.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.type === 'Rent Payment'
                                ? 'bg-blue-100 text-blue-800'
                                : payment.type === 'Security Deposit'
                                ? 'bg-purple-100 text-purple-800'
                                : payment.type === 'Maintenance Fee'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.type === 'Advance'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'Completed' || payment.status === 'On Time'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'Late'
                                ? 'bg-orange-100 text-orange-800'
                                : payment.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.status === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-1">
                              {payment.referenceNumber && (
                                <div className="font-mono text-xs text-gray-500">
                                  {payment.referenceNumber}
                                </div>
                              )}
                              {payment.receiptPath ? (
                                <a
                                  href={payment.receiptPath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-600 hover:text-teal-800 text-xs"
                                >
                                  View Receipt
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">No receipt</span>
                              )}
                            </div>
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
                      AED {paymentStats.totalAmountPaid?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Payments</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {paymentStats.totalPayments || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Average Payment</p>
                    <p className="text-2xl font-bold text-purple-600">
                      AED {paymentStats.averagePayment?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Payment Reliability</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {paymentStats.paymentReliability || 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentStats.onTimePayments || 0} on time / {paymentStats.totalPayments || 0} total
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
