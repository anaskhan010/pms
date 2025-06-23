import { useState } from "react";

const TenantsPage = () => {
  // Sample tenant data
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+966 50 123 4567",
      nationality: "United States",
      occupation: "Software Engineer",
      apartment: "A-101",
      building: "Al Faisaliah Residences",
      contractStart: "2023-01-15",
      contractEnd: "2024-01-14",
      ejariNumber: "RE-2023-12345",
      ejariExpiry: "2024-01-14",
      ejariDocument:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1064&q=80",
      monthlyRent: "2,500",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+966 55 987 6543",
      nationality: "United Kingdom",
      occupation: "Marketing Manager",
      apartment: "B-205",
      building: "Kingdom Tower Apartments",
      contractStart: "2023-02-01",
      contractEnd: "2024-01-31",
      ejariNumber: "RE-2023-67890",
      ejariExpiry: "2024-01-31",
      ejariDocument:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1064&q=80",
      monthlyRent: "3,200",
      status: "Active",
    },
    {
      id: 3,
      name: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      phone: "+966 52 456 7890",
      nationality: "Egypt",
      occupation: "Accountant",
      apartment: "C-310",
      building: "Red Sea Residence",
      contractStart: "2022-10-01",
      contractEnd: "2023-09-30",
      ejariNumber: "",
      ejariExpiry: "",
      ejariDocument: null,
      monthlyRent: "1,800",
      status: "Inactive",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    occupation: "",
    apartment: "",
    building: "",
    contractStart: "",
    contractEnd: "",
    ejariNumber: "",
    ejariExpiry: "",
    ejariDocument: null,
    monthlyRent: "",
    status: "Active",
  });

  const [ejariPreview, setEjariPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        // Update form data with the file
        setFormData({
          ...formData,
          [name]: file,
        });

        // Create a preview URL for the uploaded file
        if (name === "ejariDocument") {
          const reader = new FileReader();
          reader.onloadend = () => {
            setEjariPreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }
    } else {
      // Handle regular input fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate Ejari document if Ejari number is provided
    if (formData.ejariNumber && !formData.ejariDocument) {
      alert("Please upload the Ejari document to verify the Ejari number.");
      return;
    }

    // Create a new tenant object with file URL for the Ejari document
    const newTenant = {
      id: tenants.length + 1,
      ...formData,
      // In a real app, you would upload the file to a server and get a URL back
      // For this demo, we'll use the preview URL if available
      ejariDocument: ejariPreview || null,
    };

    setTenants([...tenants, newTenant]);
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      nationality: "",
      occupation: "",
      apartment: "",
      building: "",
      contractStart: "",
      contractEnd: "",
      ejariNumber: "",
      ejariExpiry: "",
      ejariDocument: null,
      monthlyRent: "",
      status: "Active",
    });
    setEjariPreview(null);
  };

  const handleDelete = (id) => {
    setTenants(tenants.filter((tenant) => tenant.id !== id));
  };

  return (
    <div className=" mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tenants</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200 transform hover:-translate-y-1 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
          Add New Tenant
        </button>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto sm:overflow-x-auto md:overflow-x-auto lg:overflow-x-auto xl:overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Apartment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Ejari
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tenant.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.apartment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tenant.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tenant.ejariDocument ? (
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">
                          Verified
                        </span>
                        <button
                          onClick={() =>
                            window.open(tenant.ejariDocument, "_blank")
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                        </button>
                      </div>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                        Not Available
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md mr-2 transition-colors duration-200 inline-flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md transition-colors duration-200 inline-flex items-center"
                      onClick={() => handleDelete(tenant.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-y-auto max-h-[90vh] overflow-hidden">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Add New Tenant</h2>
                  <p className="text-blue-100 mt-1">
                    Enter tenant details and contract information
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-blue-200 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>

                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter tenant name"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter tenant email"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter tenant phone"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="nationality"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nationality
                        </label>
                        <input
                          type="text"
                          id="nationality"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter nationality"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="occupation"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Occupation
                        </label>
                        <input
                          type="text"
                          id="occupation"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter occupation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Contract Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="building"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Building <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="building"
                          name="building"
                          value={formData.building}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Building name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="apartment"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Apartment <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="apartment"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Apartment number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="contractStart"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contract Start <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="contractStart"
                          name="contractStart"
                          value={formData.contractStart}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contractEnd"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contract End <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="contractEnd"
                          name="contractEnd"
                          value={formData.contractEnd}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="monthlyRent"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Monthly Rent <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">SAR</span>
                        </div>
                        <input
                          type="text"
                          id="monthlyRent"
                          name="monthlyRent"
                          value={formData.monthlyRent}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter monthly rent"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="ejariNumber"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Registration Number
                          </label>
                          <input
                            type="text"
                            id="ejariNumber"
                            name="ejariNumber"
                            value={formData.ejariNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter registration number"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="ejariExpiry"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Registration Expiry
                          </label>
                          <input
                            type="date"
                            id="ejariExpiry"
                            name="ejariExpiry"
                            value={formData.ejariExpiry}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="ejariDocument"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Registration Document{" "}
                          <span className="text-blue-600">
                            (Upload verification document)
                          </span>
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors duration-200">
                          <div className="space-y-1 text-center">
                            {ejariPreview ? (
                              <div className="relative">
                                <img
                                  src={ejariPreview}
                                  alt="Registration Document Preview"
                                  className="mx-auto h-32 object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEjariPreview(null);
                                    setFormData({
                                      ...formData,
                                      ejariDocument: null,
                                    });
                                  }}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors duration-200"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="ejariDocument"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="ejariDocument"
                                  name="ejariDocument"
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </div>
                        </div>
                        {formData.ejariDocument && (
                          <p className="mt-2 text-sm text-green-600">
                            <span className="font-medium">
                              File ready for upload:
                            </span>{" "}
                            {formData.ejariDocument.name}
                          </p>
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold text-amber-600">
                              Important:
                            </span>{" "}
                            The Real Estate Registration is a mandatory system
                            for all rental properties in Saudi Arabia. Please
                            ensure the document is valid and clearly shows the
                            registration number and expiry date.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-md hover:from-blue-700 hover:to-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200 transform hover:-translate-y-1"
                  >
                    Save Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
