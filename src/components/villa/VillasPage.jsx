import { useState } from "react";
import { Link } from "react-router-dom";
import VillaCard from "./VillaCard";
import VillaFilters from "./VillaFilters";

const VillasPage = () => {
  // Sample villa data
  const [villas, setVillas] = useState([
    {
      id: 1,
      title: "Luxury Desert Oasis Villa",
      location: "Al Riyadh, Riyadh",
      price: "SAR 12,500,000",
      bedrooms: 6,
      bathrooms: 7,
      area: "850 sq m",
      yearBuilt: 2021,
      features: ["Private Pool", "Garden", "Smart Home", "Security System"],
      description:
        "Magnificent luxury villa with panoramic desert views, featuring modern architecture and premium finishes throughout.",
      status: "For Sale",
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1475&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      ],
    },
    {
      id: 2,
      title: "Modern Waterfront Villa",
      location: "Jeddah Corniche, Jeddah",
      price: "SAR 18,900,000",
      bedrooms: 8,
      bathrooms: 10,
      area: "1200 sq m",
      yearBuilt: 2022,
      features: [
        "Private Beach",
        "Infinity Pool",
        "Home Theater",
        "Gym",
        "Elevator",
      ],
      description:
        "Stunning waterfront villa with direct beach access, featuring contemporary design and luxury amenities for the most discerning buyer.",
      status: "For Sale",
      images: [
        "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1615529162924-f8605388461d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      ],
    },
    {
      id: 3,
      title: "Traditional Arabian Villa",
      location: "Al Khobar, Eastern Province",
      price: "SAR 8,750,000",
      bedrooms: 5,
      bathrooms: 6,
      area: "650 sq m",
      yearBuilt: 2019,
      features: ["Private Garden", "Majlis", "Outdoor Kitchen", "Fountain"],
      description:
        "Elegant villa combining traditional Arabian architecture with modern comforts, perfect for family living and entertaining.",
      status: "For Sale",
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      ],
    },
    {
      id: 4,
      title: "Exclusive Golf Course Villa",
      location: "KAEC, King Abdullah Economic City",
      price: "SAR 15,200,000",
      bedrooms: 7,
      bathrooms: 8,
      area: "920 sq m",
      yearBuilt: 2020,
      features: [
        "Golf Course View",
        "Indoor Pool",
        "Wine Cellar",
        "Smart Home",
      ],
      description:
        "Prestigious villa overlooking the championship golf course, offering luxury living with exceptional amenities and privacy.",
      status: "For Sale",
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort villas
  const filteredVillas = villas
    .filter(
      (villa) =>
        (filterStatus === "All" || villa.status === filterStatus) &&
        (villa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          villa.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") return b.yearBuilt - a.yearBuilt;
      if (sortBy === "oldest") return a.yearBuilt - b.yearBuilt;
      if (sortBy === "priceHigh")
        return (
          parseFloat(b.price.replace(/[^0-9.]/g, "")) -
          parseFloat(a.price.replace(/[^0-9.]/g, ""))
        );
      if (sortBy === "priceLow")
        return (
          parseFloat(a.price.replace(/[^0-9.]/g, "")) -
          parseFloat(b.price.replace(/[^0-9.]/g, ""))
        );
      return 0;
    });

  return (
    <div className=" mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Luxury Villas
        </h1>
        <Link
          to="/admin/villas/add"
          className="bg-teal-600 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200 transform hover:-translate-y-1 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add New Villa
        </Link>
      </div>

      {/* Filters Component */}
      <VillaFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Villas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {filteredVillas.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}
      </div>

      {/* No Results */}
      {filteredVillas.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No villas found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default VillasPage;
