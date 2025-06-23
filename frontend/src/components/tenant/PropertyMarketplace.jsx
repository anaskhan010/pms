import React, { useState, useEffect } from "react";
import { Card, Button, Select } from "../common";
import { propertyService } from "../../services/propertyService";
import { applicationService } from "../../services/applicationService";
import { useAuth } from "../../contexts/AuthContext";
import PropertyApplicationForm from "../property/PropertyApplicationForm";

const PropertyMarketplace = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    min_rent: "",
    max_rent: "",
    bedrooms: "",
    furnished: "",
  });

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getAvailableProperties();

      if (response.success) {
        setProperties(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.name.toLowerCase().includes(searchTerm) ||
          property.address.toLowerCase().includes(searchTerm) ||
          property.city.toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((property) => property.type === filters.type);
    }

    // Rent range filter
    if (filters.min_rent) {
      filtered = filtered.filter(
        (property) => property.monthly_rent >= parseInt(filters.min_rent)
      );
    }
    if (filters.max_rent) {
      filtered = filtered.filter(
        (property) => property.monthly_rent <= parseInt(filters.max_rent)
      );
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      filtered = filtered.filter(
        (property) => property.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // Furnished filter
    if (filters.furnished) {
      filtered = filtered.filter(
        (property) => property.furnished === filters.furnished
      );
    }

    setFilteredProperties(filtered);
  };

  // Stable callback functions to prevent re-renders
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyForProperty = (property) => {
    setSelectedProperty(property);
    setShowApplicationForm(true);
  };

  const handleApplicationSubmitted = (application) => {
    setShowApplicationForm(false);
    setSelectedProperty(null);
    // Show success message or redirect
    alert(
      "Application submitted successfully! You will be notified of the status soon."
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (showApplicationForm && selectedProperty) {
    return (
      <PropertyApplicationForm
        property={selectedProperty}
        onSuccess={handleApplicationSubmitted}
        onCancel={() => {
          setShowApplicationForm(false);
          setSelectedProperty(null);
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Properties
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadProperties} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Find Your Perfect Home
          </h1>
          <p className="mt-2 text-gray-600">
            Browse available properties and apply for your next rental
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={loadProperties}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card header="Search & Filter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 pl-10 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div>
            <input
              type="number"
              placeholder="Min Rent"
              name="min_rent"
              value={filters.min_rent}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Max Rent"
              name="max_rent"
              value={filters.max_rent}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Min Bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
            />
          </div>

          <Select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All Types" },
              { value: "apartment", label: "Apartment" },
              { value: "villa", label: "Villa" },
              { value: "townhouse", label: "Townhouse" },
            ]}
          />

          <Select
            name="furnished"
            value={filters.furnished}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "Any Furnishing" },
              { value: "furnished", label: "Furnished" },
              { value: "unfurnished", label: "Unfurnished" },
              { value: "semi-furnished", label: "Semi-furnished" },
            ]}
          />
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {loading
            ? "Loading..."
            : `${filteredProperties.length} properties found`}
        </p>
        {filters.search ||
        filters.type ||
        filters.min_rent ||
        filters.max_rent ||
        filters.bedrooms ||
        filters.furnished ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilters({
                search: "",
                type: "",
                min_rent: "",
                max_rent: "",
                bedrooms: "",
                furnished: "",
              })
            }
          >
            Clear Filters
          </Button>
        ) : null}
      </div>

      {/* Property Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                )}

                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-90 text-gray-800 rounded-full capitalize">
                    {property.type}
                  </span>
                </div>

                {/* Furnished Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-teal-600 bg-opacity-90 text-white rounded-full capitalize">
                    {property.furnished?.replace("-", " ")}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {property.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{property.address}</p>

                {/* Property Features */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.area_sqft} sq ft</span>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(property.monthly_rent)}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                  <Button
                    onClick={() => handleApplyForProperty(property)}
                    variant="primary"
                    size="sm"
                  >
                    Apply Now
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Available from:{" "}
                      {new Date(property.available_from).toLocaleDateString()}
                    </span>
                    <span>Unit: {property.unit_number}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or check back later for new
            listings.
          </p>
          <Button
            onClick={() =>
              setFilters({
                search: "",
                type: "",
                min_rent: "",
                max_rent: "",
                bedrooms: "",
                furnished: "",
              })
            }
            variant="secondary"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyMarketplace;
