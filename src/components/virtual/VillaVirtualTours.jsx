import { useState, useEffect } from "react";
import VideoModal from "./VideoModal";

const VillaVirtualTours = () => {
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [filterLocation, setFilterLocation] = useState("All");

  // Sample villa data
  const villasData = [
    {
      id: 1,
      title: "Luxury Desert Oasis Villa",
      location: "Riyadh",
      address: "King Fahd Road, Al Riyadh",
      price: "SAR 12,500,000",
      bedrooms: 6,
      bathrooms: 7,
      area: "850 sq m",
      yearBuilt: 2021,
      features: ["Private Pool", "Garden", "Smart Home", "Security System"],
      description: "Magnificent luxury villa with panoramic desert views, featuring modern architecture and premium finishes throughout.",
      status: "For Sale",
      videoUrl: "https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1475&q=80"
    },
    {
      id: 2,
      title: "Modern Waterfront Villa",
      location: "Jeddah",
      address: "Jeddah Corniche, Jeddah",
      price: "SAR 18,900,000",
      bedrooms: 8,
      bathrooms: 10,
      area: "1200 sq m",
      yearBuilt: 2022,
      features: ["Private Beach", "Infinity Pool", "Home Theater", "Gym", "Elevator"],
      description: "Stunning waterfront villa with direct beach access, featuring contemporary design and luxury amenities for the most discerning buyer.",
      status: "For Sale",
      videoUrl: "https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4",
      image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      title: "Traditional Arabian Villa",
      location: "Eastern Province",
      address: "Al Khobar, Eastern Province",
      price: "SAR 8,750,000",
      bedrooms: 5,
      bathrooms: 6,
      area: "650 sq m",
      yearBuilt: 2019,
      features: ["Private Garden", "Majlis", "Outdoor Kitchen", "Fountain"],
      description: "Elegant villa combining traditional Arabian architecture with modern comforts, perfect for family living and entertaining.",
      status: "For Sale",
      videoUrl: "https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80"
    },
    {
      id: 4,
      title: "Exclusive Golf Course Villa",
      location: "KAEC",
      address: "KAEC, King Abdullah Economic City",
      price: "SAR 15,200,000",
      bedrooms: 7,
      bathrooms: 8,
      area: "920 sq m",
      yearBuilt: 2020,
      features: ["Golf Course View", "Indoor Pool", "Wine Cellar", "Smart Home"],
      description: "Prestigious villa overlooking the championship golf course, offering luxury living with exceptional amenities and privacy.",
      status: "For Sale",
      videoUrl: "https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
    }
  ];

  // Get unique locations for filter
  const locations = ["All", ...new Set(villasData.map(villa => villa.location))];

  // Load villas on component mount
  useEffect(() => {
    setVillas(villasData);
  }, []);

  // Handle villa selection
  const handleVillaSelect = (villa) => {
    setSelectedVilla(villa);
    setShowVideo(true);
  };

  // Close video modal
  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  // Filter villas by location
  const filteredVillas = filterLocation === "All" 
    ? villas 
    : villas.filter(villa => villa.location === filterLocation);

  return (
    <div>
      {/* Location Filter */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Filter by Location
        </h2>
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => (
            <button
              key={location}
              className={`px-4 py-2 rounded-full transition-colors ${
                filterLocation === location
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFilterLocation(location)}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {/* Villas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredVillas.map((villa) => (
          <div
            key={villa.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={() => handleVillaSelect(villa)}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={villa.image}
                alt={villa.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md">
                  {villa.location}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{villa.title}</h3>
              <p className="text-gray-600 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {villa.address}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-3 text-gray-600">
                  <span className="flex items-center" title="Bedrooms">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {villa.bedrooms}
                  </span>
                  <span className="flex items-center" title="Bathrooms">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {villa.bathrooms}
                  </span>
                  <span className="flex items-center" title="Area">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {villa.area}
                  </span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
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

      {/* Video Modal */}
      {showVideo && selectedVilla && (
        <VideoModal
          title={`Virtual Tour - ${selectedVilla.title}`}
          videoUrl={selectedVilla.videoUrl}
          onClose={handleCloseVideo}
          details={[
            { label: "Location", value: selectedVilla.address },
            { label: "Size", value: selectedVilla.area },
            { label: "Bedrooms", value: selectedVilla.bedrooms },
            { label: "Bathrooms", value: selectedVilla.bathrooms },
            { label: "Year Built", value: selectedVilla.yearBuilt }
          ]}
        />
      )}
    </div>
  );
};

export default VillaVirtualTours;
