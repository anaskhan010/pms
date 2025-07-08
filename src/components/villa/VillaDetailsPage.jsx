import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const VillaDetailsPage = () => {
  const { id } = useParams();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Sample villa data
  const villasData = [
    {
      id: 1,
      title: "Luxury Desert Oasis Villa",
      location: "Al Riyadh, Riyadh",
      price: "SAR 12,500,000",
      bedrooms: 6,
      bathrooms: 7,
      area: "850 sq m",
      yearBuilt: 2021,
      features: [
        "Private Pool",
        "Garden",
        "Smart Home",
        "Security System",
        "Marble Flooring",
        "Double Garage",
      ],
      description:
        "Magnificent luxury villa with panoramic desert views, featuring modern architecture and premium finishes throughout. This exclusive property offers spacious living areas, a gourmet kitchen, and a private pool surrounded by beautifully landscaped gardens. The smart home system controls lighting, climate, and security for ultimate convenience and peace of mind.",
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
        "Smart Home",
      ],
      description:
        "Stunning waterfront villa with direct beach access, featuring contemporary design and luxury amenities for the most discerning buyer. This exceptional property offers panoramic sea views, spacious living areas, and premium finishes throughout. The infinity pool seems to merge with the horizon, creating a truly magical setting for relaxation and entertainment.",
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
      features: [
        "Private Garden",
        "Majlis",
        "Outdoor Kitchen",
        "Fountain",
        "Guest House",
      ],
      description:
        "Elegant villa combining traditional Arabian architecture with modern comforts, perfect for family living and entertaining. This beautiful property features authentic design elements including ornate arches, intricate woodwork, and a central courtyard with a fountain. The spacious majlis provides the perfect setting for traditional Saudi hospitality.",
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
        "Home Office",
      ],
      description:
        "Prestigious villa overlooking the championship golf course, offering luxury living with exceptional amenities and privacy. This exclusive property features expansive living spaces, premium finishes, and state-of-the-art technology throughout. The indoor pool and spa area provide year-round relaxation, while the spacious terraces offer stunning views of the manicured golf course.",
      status: "For Sale",
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      ],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundVilla = villasData.find((v) => v.id === parseInt(id));
      setVilla(foundVilla);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Villa Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The villa you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/admin/villas"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Villas
        </Link>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/admin/villas" className="hover:text-blue-600">
          Villas
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mx-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-gray-800 font-medium">{villa.title}</span>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Main Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={villa.images[activeImage]}
            alt={villa.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md">
              {villa.status}
            </span>
          </div>
        </div>

        {/* Thumbnail Images */}
        <div className="flex p-4 space-x-2 bg-gray-100">
          {villa.images.map((image, index) => (
            <div
              key={index}
              className={`h-20 w-32 cursor-pointer rounded-md overflow-hidden border-2 ${
                activeImage === index ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => setActiveImage(index)}
            >
              <img
                src={image}
                alt={`${villa.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Villa Details */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {villa.title}
              </h1>
              <p className="text-gray-600 flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {villa.location}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-3xl font-bold text-blue-600">{villa.price}</p>
            </div>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="text-lg font-semibold">{villa.bedrooms}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="text-lg font-semibold">{villa.bathrooms}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="text-lg font-semibold">{villa.area}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Year Built</p>
                  <p className="text-lg font-semibold">{villa.yearBuilt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">{villa.description}</p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Features</h2>
            <div className="flex flex-wrap gap-2">
              {villa.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/admin/villas"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Villas
            </Link>
            <Link
              to={`/admin/villas/edit/${villa.id}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Villa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillaDetailsPage;
