import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApiService } from "../../services/adminApiService";
import notificationService from "../../services/notificationService";
import { Card, Button, LoadingSpinner, Alert, DeleteConfirmationModal } from "../common";





const TenantsPage = () => {
  const navigate = useNavigate();

  // State management
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    tenantId: null,
    tenantName: '',
    loading: false
  });

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    nationality: '',
    status: '',
    id_document_type: ''
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch tenants with enterprise features
  const fetchTenants = useCallback(async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(newFilters).filter(([_, value]) => value !== '')
        )
      };

      const response = await adminApiService.getTenants(params);

      if (response.success) {
        setTenants(response.data);
        setCurrentPage(response.pagination?.page || page);
        setTotalPages(response.pagination?.pages || 1);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.error || 'Failed to fetch tenants');
        setTenants([]);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
      setError('An unexpected error occurred while fetching tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  // Fetch tenant statistics
  const fetchTenantStatistics = useCallback(async () => {
    try {
      const response = await adminApiService.getTenantStatistics();
      if (response.success) {
        setStatistics(response.data);
      } else {
        console.warn('Failed to fetch tenant statistics:', response.error);
      }
    } catch (error) {
      console.error('Error fetching tenant statistics:', error);
    }
  }, []);

 

  // Initial load
  useEffect(() => {
   
    fetchTenants(1);
    fetchTenantStatistics();
  }, [fetchTenants, fetchTenantStatistics]);

  // Handler functions
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchTenants(1, newFilters);
  };

  const handleSort = (field) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    fetchTenants(currentPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTenants(page);
  };

  const handleSelectTenant = (tenantId) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId)
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTenants.length === tenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(tenants.map(tenant => tenant.tenant_id));
    }
  };

  const handleBulkOperation = async (operation, reason = '') => {
    if (selectedTenants.length === 0) {
      notificationService.warning('Please select tenants first');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${operation} ${selectedTenants.length} tenant(s)?`)) {
      return;
    }

    try {
      setBulkLoading(true);

      const response = await adminApiService.bulkTenantOperations({
        tenant_ids: selectedTenants,
        operation,
        reason
      });

      if (response.success) {
        notificationService.success(`Bulk ${operation} completed successfully`);
        setSelectedTenants([]);
        fetchTenants(currentPage);
        fetchTenantStatistics(); // Refresh statistics after bulk operation
      } else {
        notificationService.error(`Bulk operation failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
      notificationService.error('An error occurred during bulk operation');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminApiService.exportTenants(filters);
      if (response.success) {
        notificationService.success('Tenants exported successfully');
      } else {
        notificationService.error(`Export failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      notificationService.error('An error occurred during export');
    }
  };

  // Handle individual tenant operations
  const handleViewTenant = (tenantId) => {
    navigate(`/admin/tenants/${tenantId}`);
  };

  const handleEditTenant = async (tenantId) => {
    try {
      setLoading(true);

      // First get the tenant data
      const response = await adminApiService.getTenant(tenantId);
      if (response.success) {
        const tenant = response.data;

        // Populate form with existing tenant data
        setFormData({
          name: `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim(),
          email: tenant.email || '',
          phone: tenant.phone_number || '',
          address: tenant.address || '',
          gender: tenant.gender || 'Male',
          nationality: tenant.nationality || '',
          dateOfBirth: tenant.date_of_birth ? tenant.date_of_birth.split('T')[0] : '',
          occupation: tenant.occupation || '',
          selectedBuilding: '',
          selectedFloor: '',
          selectedApartment: '',
          contractStart: '',
          contractEnd: '',
          ejariNumber: tenant.registration_number || '',
          ejariExpiry: tenant.registration_expiry ? tenant.registration_expiry.split('T')[0] : '',
          ejariDocument: null,
          monthlyRent: '',
          status: 'Active',
        });

        // Set edit mode
        setIsEditMode(true);
        setEditingTenantId(tenantId);

        // Load buildings for apartment selection
        await loadBuildings();

        // Open modal
        setIsModalOpen(true);
      } else {
        notificationService.error(`Failed to fetch tenant for editing: ${response.error}`);
      }
    } catch (error) {
      console.error('Error preparing tenant edit:', error);
      notificationService.error('An error occurred while preparing tenant for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = (tenantId, tenantName = '') => {
    setDeleteModal({
      isOpen: true,
      tenantId,
      tenantName,
      loading: false
    });
  };

  const confirmDeleteTenant = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const response = await adminApiService.deleteTenant(deleteModal.tenantId);
      if (response.success) {
        notificationService.success('Tenant deleted successfully');
        // Refresh the tenant list and statistics
        fetchTenants(currentPage);
        fetchTenantStatistics();
        setDeleteModal({ isOpen: false, tenantId: null, tenantName: '', loading: false });
      } else {
        notificationService.error(`Failed to delete tenant: ${response.error}`);
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      notificationService.error('An error occurred while deleting the tenant');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteTenant = () => {
    setDeleteModal({ isOpen: false, tenantId: null, tenantName: '', loading: false });
  };

  // Handle tenant creation and update
  const handleCreateTenant = async (tenantData) => {
    try {
      setLoading(true);
      let response;

      if (isEditMode && editingTenantId) {
        // Update existing tenant
        response = await adminApiService.updateTenant(editingTenantId, tenantData);
        if (response.success) {
          notificationService.success('Tenant updated successfully');
        }
      } else {
        // Create new tenant
        response = await adminApiService.createTenant(tenantData);
        if (response.success) {
          notificationService.success('Tenant created successfully');
        }
      }

      if (response.success) {
        setIsModalOpen(false);
        resetForm();
        // Refresh the tenant list and statistics
        fetchTenants(isEditMode ? currentPage : 1); // Stay on current page for edit, go to first for create
        fetchTenantStatistics();
      } else {
        const errorMessage = response.error || (isEditMode ? 'Failed to update tenant' : 'Failed to create tenant');
        notificationService.error(errorMessage);
        if (response.details && response.details.length > 0) {
          console.error('Validation errors:', response.details);
        }
      }
    } catch (error) {
      console.error('Error with tenant operation:', error);
      const errorMessage = `An error occurred while ${isEditMode ? 'updating' : 'creating'} the tenant`;
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male",
    nationality: "",
    dateOfBirth: "",
    occupation: "",
    selectedBuilding: "",
    selectedFloor: "",
    selectedApartment: "",
    contractStart: "",
    contractEnd: "",
    ejariNumber: "",
    ejariExpiry: "",
    ejariDocument: null,
    monthlyRent: "",
    status: "Active",
  });

  // Building/Floor/Apartment selection state
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingApartments, setLoadingApartments] = useState(false);

  const [ejariPreview, setEjariPreview] = useState(null);

  // Load buildings when modal opens
  const loadBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const response = await adminApiService.getBuildings();
      if (response.success) {
        setBuildings(response.data.map(building => ({
          property_id: building.buildingId,
          name: building.buildingName,
          address: building.buildingAddress
        })));
      } else {
        console.error('Error loading buildings:', response.error);
        setBuildings([]);
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
      setBuildings([]);
    } finally {
      setLoadingBuildings(false);
    }
  };

  // Load floors when building is selected
  const loadFloors = async (buildingId) => {
    try {
      setLoadingFloors(true);
      const response = await adminApiService.getFloorsByBuilding(buildingId);
      if (response.success) {
        setFloors(response.data.map(floor => ({
          id: floor.floorId,
          floor_number: floor.floorId,
          name: floor.floorName
        })));
      } else {
        console.error('Error loading floors:', response.error);
        setFloors([]);
      }
    } catch (error) {
      console.error('Error loading floors:', error);
      setFloors([]);
    } finally {
      setLoadingFloors(false);
    }
  };

  // Load apartments when floor is selected
  const loadApartments = async (floorId) => {
    try {
      setLoadingApartments(true);
      const response = await adminApiService.getApartmentsByFloor(floorId);
      if (response.success) {
        setApartments(response.data.map(apartment => ({
          unit_id: apartment.apartmentId,
          unit_number: `${apartment.bedrooms}BR-${apartment.apartmentId}`,
          bedrooms: apartment.bedrooms,
          bathrooms: apartment.bathrooms,
          rent_amount: apartment.rentPrice,
          status: apartment.status || 'available'
        })));
      } else {
        console.error('Error loading apartments:', response.error);
        setApartments([]);
      }
    } catch (error) {
      console.error('Error loading apartments:', error);
      setApartments([]);
    } finally {
      setLoadingApartments(false);
    }
  };

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
      const newFormData = {
        ...formData,
        [name]: value,
      };

      // Handle cascading selections
      if (name === "selectedBuilding") {
        newFormData.selectedFloor = "";
        newFormData.selectedApartment = "";
        setFloors([]);
        setApartments([]);
        if (value) {
          loadFloors(value);
        }
      } else if (name === "selectedFloor") {
        newFormData.selectedApartment = "";
        setApartments([]);
        if (value) {
          loadApartments(value); // Pass floorId directly
        }
      }

      setFormData(newFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Ejari document if Ejari number is provided
    if (formData.ejariNumber && !formData.ejariDocument) {
      notificationService.warning("Please upload the Ejari document to verify the Ejari number.");
      return;
    }

    // Prepare tenant data for API call
    const selectedBuilding = buildings.find(b => b.property_id === formData.selectedBuilding);
    const selectedApartment = apartments.find(a => a.unit_id === formData.selectedApartment);

    console.log('Form data:', formData);
    console.log('Selected building:', selectedBuilding);
    console.log('Selected apartment:', selectedApartment);

    const tenantData = {
      firstName: formData.name.split(' ')[0] || formData.name,
      lastName: formData.name.split(' ').slice(1).join(' ') || '',
      email: formData.email,
      phoneNumber: formData.phone,
      address: formData.address || 'Dubai, UAE',
      gender: formData.gender || 'Male',
      nationality: formData.nationality || 'UAE',
      dateOfBirth: formData.dateOfBirth || '1990-01-01',
      registrationNumber: formData.ejariNumber || null,
      registrationExpiry: formData.ejariExpiry || null,
      occupation: formData.occupation || 'Professional',
    };

    // Add additional fields for creation only
    if (!isEditMode) {
      tenantData.password = 'Tenant123!'; // Default password for tenant accounts
      tenantData.apartmentId = formData.selectedApartment || null;
      tenantData.contractStartDate = formData.contractStart || null;
      tenantData.contractEndDate = formData.contractEnd || null;
      tenantData.securityFee = selectedApartment?.rent_amount ? selectedApartment.rent_amount * 2 : 0;
      tenantData.ejariDocument = formData.ejariDocument || null;
    }

    console.log('Tenant data being sent:', tenantData);

    // Call the API to create tenant
    await handleCreateTenant(tenantData);

    // Reset form only if creation was successful (handleCreateTenant will handle the modal closing)
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      gender: "Male",
      nationality: "",
      dateOfBirth: "",
      occupation: "",
      selectedBuilding: "",
      selectedFloor: "",
      selectedApartment: "",
      contractStart: "",
      contractEnd: "",
      ejariNumber: "",
      ejariExpiry: "",
      ejariDocument: null,
      monthlyRent: "",
      status: "Active",
    });
    setEjariPreview(null);
    setBuildings([]);
    setFloors([]);
    setApartments([]);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      gender: "Male",
      nationality: "",
      dateOfBirth: "",
      occupation: "",
      selectedBuilding: "",
      selectedFloor: "",
      selectedApartment: "",
      contractStart: "",
      contractEnd: "",
      ejariNumber: "",
      ejariExpiry: "",
      ejariDocument: null,
      monthlyRent: "",
      status: "Active",
    });
    setEjariPreview(null);
    setBuildings([]);
    setFloors([]);
    setApartments([]);
    setIsEditMode(false);
    setEditingTenantId(null);
  };



  // Loading state
  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="mt-2 text-gray-600">
              Manage all tenants with advanced filtering and bulk operations
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <Button
              onClick={() => {
                fetchTenants(currentPage);
                fetchTenantStatistics();
              }}
              variant="secondary"
              size="sm"
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="secondary"
              size="sm"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                loadBuildings();
              }}
              variant="primary"
            >
              Add Tenant
            </Button>
          </div>
        </div>
        {/* Error Alert */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search tenants..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <select
                value={filters.nationality}
                onChange={(e) => handleFilterChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Nationalities</option>
                <option value="Saudi">Saudi</option>
                <option value="UAE">UAE</option>
                <option value="Egyptian">Egyptian</option>
                <option value="Pakistani">Pakistani</option>
                <option value="Indian">Indian</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={filters.id_document_type}
                onChange={(e) => handleFilterChange('id_document_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Types</option>
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>
          </div>
        </Card>
        {/* Bulk Actions */}
        {selectedTenants.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedTenants.length} tenant(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleBulkOperation('activate')}
                  variant="success"
                  size="sm"
                  loading={bulkLoading}
                >
                  Activate
                </Button>
                <Button
                  onClick={() => handleBulkOperation('deactivate')}
                  variant="warning"
                  size="sm"
                  loading={bulkLoading}
                >
                  Deactivate
                </Button>
                <Button
                  onClick={() => handleBulkOperation('delete')}
                  variant="danger"
                  size="sm"
                  loading={bulkLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}
        {/* Tenants Table */}
        <Card header={
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Tenants List
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTenants.length === tenants.length && tenants.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('tenant_id')}
                  >
                    ID {sortBy === 'tenant_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('first_name')}
                  >
                    Name {sortBy === 'first_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nationality
                  </th>
      
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_at')}
                  >
                    Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No tenants found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant) => (
                    <tr
                      key={tenant.tenant_id}
                      className={`hover:bg-gray-50 ${selectedTenants.includes(tenant.tenant_id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.tenant_id)}
                          onChange={() => handleSelectTenant(tenant.tenant_id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.tenantId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-teal-700">
                                {tenant.firstName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {tenant.firstName} {tenant.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.phoneNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.nationality || 'N/A'}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {tenant.id_document_type}
                        </span>
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      tenant.status === "Active"
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
        }`}>
      {tenant.status}
        </span>
      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewTenant(tenant.tenantId)}
                            disabled={loading}
                          >
                            View
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEditTenant(tenant.tenantId)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteTenant(tenant.tenantId, `${tenant.firstName} ${tenant.lastName}`)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
        {/* Add Tenant Modal */}
        {isModalOpen && (
          <div className="top-0 left-0">
            <div className="fixed inset-0  bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 to-teal-800 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {isEditMode ? 'Edit Tenant' : 'Add New Tenant'}
                      </h2>
                      <p className="text-slate-300 text-sm mt-1">
                        {isEditMode ? 'Update tenant profile information' : 'Create a new tenant profile with property assignment'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="text-slate-300 hover:text-white transition-colors duration-200 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Form Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div className="flex items-center pb-3 border-b border-slate-200">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                        </div>
                        <div>
                          <label htmlFor="name" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                              placeholder="Enter full name"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
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
                              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                              placeholder="Enter email address"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
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
                              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="nationality" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                              Nationality
                            </label>
                            <input
                              type="text"
                              id="nationality"
                              name="nationality"
                              value={formData.nationality}
                              onChange={handleChange}
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                              placeholder="Enter nationality"
                            />
                          </div>
                          <div>
                            <label htmlFor="occupation" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                              Occupation
                            </label>
                            <input
                              type="text"
                              id="occupation"
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleChange}
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                              placeholder="Enter occupation"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                            placeholder="Enter full address"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="gender" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                              Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="gender"
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="dateOfBirth" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id="dateOfBirth"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                            />
                          </div>
                        </div>
                        {/* Building/Floor/Apartment Selection */}
                        <div className="space-y-4">
                          <div className="flex items-center pb-3 border-b border-slate-200">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900">Property Assignment</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Building Selection */}
                            <div>
                              <label htmlFor="selectedBuilding" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Building <span className="text-red-500">*</span>
                              </label>
                              <select
                                id="selectedBuilding"
                                name="selectedBuilding"
                                value={formData.selectedBuilding}
                                onChange={handleChange}
                                required
                                disabled={loadingBuildings}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"
                              >
                                <option value="">
                                  {loadingBuildings ? "Loading buildings..." : "Select Building"}
                                </option>
                                {buildings.map((building) => (
                                  <option key={building.property_id} value={building.property_id}>
                                    {building.name} - {building.address}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {/* Floor Selection */}
                            <div>
                              <label htmlFor="selectedFloor" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Floor <span className="text-red-500">*</span>
                              </label>
                              <select
                                id="selectedFloor"
                                name="selectedFloor"
                                value={formData.selectedFloor}
                                onChange={handleChange}
                                required
                                disabled={!formData.selectedBuilding || loadingFloors}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"
                              >
                                <option value="">
                                  {loadingFloors ? "Loading floors..." : "Select Floor"}
                                </option>
                                {floors.map((floor) => (
                                  <option key={floor.id} value={floor.floor_number}>
                                    {floor.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {/* Apartment Selection */}
                            <div>
                              <label htmlFor="selectedApartment" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Apartment <span className="text-red-500">*</span>
                              </label>
                              <select
                                id="selectedApartment"
                                name="selectedApartment"
                                value={formData.selectedApartment}
                                onChange={handleChange}
                                required
                                disabled={!formData.selectedFloor || loadingApartments}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"
                              >
                                <option value="">
                                  {loadingApartments ? "Loading apartments..." : "Select Apartment"}
                                </option>
                                {apartments.map((apartment) => (
                                  <option key={apartment.unit_id} value={apartment.unit_id}>
                                    {apartment.unit_number} - {apartment.unit_type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {/* Selection Summary */}
                          {formData.selectedBuilding && formData.selectedFloor && formData.selectedApartment && (
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <svg className="w-4 h-4 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <h5 className="text-sm font-semibold text-teal-800">Selected Property:</h5>
                              </div>
                              <p className="text-sm text-teal-700">
                                {buildings.find(b => b.property_id === formData.selectedBuilding)?.property_number} -
                                Floor {formData.selectedFloor} -
                                Apartment {apartments.find(a => a.unit_id === formData.selectedApartment)?.unit_number}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Right Column */}
                      <div className="space-y-6">
                        <div className="flex items-center pb-3 border-b border-slate-200">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">Contract & Ejari Details</h3>
                        </div>
                        {/* Contract Information */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="contractStart" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Contract Start <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                id="contractStart"
                                name="contractStart"
                                value={formData.contractStart}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                              />
                            </div>
                            <div>
                              <label htmlFor="contractEnd" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Contract End <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                id="contractEnd"
                                name="contractEnd"
                                value={formData.contractEnd}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="monthlyRent" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                              Monthly Rent <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 font-medium">SAR</span>
                              </div>
                              <input
                                type="number"
                                id="monthlyRent"
                                name="monthlyRent"
                                value={formData.monthlyRent}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                                placeholder="Enter monthly rent"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="ejariNumber" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                  Ejari Registration Number
                                </label>
                                <input
                                  type="text"
                                  id="ejariNumber"
                                  name="ejariNumber"
                                  value={formData.ejariNumber}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400"
                                  placeholder="Enter Ejari number"
                                />
                              </div>
                              <div>
                                <label htmlFor="ejariExpiry" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                  Ejari Expiry Date
                                </label>
                                <input
                                  type="date"
                                  id="ejariExpiry"
                                  name="ejariExpiry"
                                  value={formData.ejariExpiry}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="ejariDocument" className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Ejari Document
                                <span className="text-teal-600 normal-case ml-1">(Upload verification document)</span>
                              </label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-teal-400 transition-colors duration-200">
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
                    </div>
                    {/* Form Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-teal-800 text-white rounded-md hover:from-slate-800 hover:to-teal-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-all duration-200"
                      >
                        {isEditMode ? 'Update Tenant' : 'Create Tenant'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={cancelDeleteTenant}
          onConfirm={confirmDeleteTenant}
          title="Delete Tenant"
          message="Are you sure you want to delete this tenant? This action cannot be undone and will remove all associated data."
          itemName={deleteModal.tenantName}
          loading={deleteModal.loading}
        />
      </div>
   
  );
};

export default TenantsPage;
