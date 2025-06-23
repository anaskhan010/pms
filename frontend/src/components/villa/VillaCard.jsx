import { Link } from "react-router-dom";

const VillaCard = ({ villa }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <img
          src={villa.images[0]}
          alt={villa.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md">
            {villa.status}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {villa.title}
        </h3>
        <p className="text-gray-600 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-bold text-blue-600">{villa.price}</p>
          <div className="flex space-x-3 text-gray-600">
            <span className="flex items-center" title="Bedrooms">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {villa.bedrooms}
            </span>
            <span className="flex items-center" title="Bathrooms">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {villa.bathrooms}
            </span>
            <span className="flex items-center" title="Area">
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              {villa.area}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{villa.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {villa.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
          {villa.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">
              +{villa.features.length - 3} more
            </span>
          )}
        </div>
        <Link
          to={`/admin/villas/${villa.id}`}
          className="block w-full text-center bg-teal-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VillaCard;
