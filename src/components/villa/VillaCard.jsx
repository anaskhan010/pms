import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const VillaCard = ({ villa, onEdit, onDelete, onAssign }) => {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <img
          src={villa.images && villa.images.length > 0
            ? `${import.meta.env.VITE_APP_IMAGE_URL}${villa.images[0].imageUrl}`
            : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1475&q=80"
          }
          alt={villa.Name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-white text-sm font-semibold rounded-full shadow-md ${
            villa.status === 'Available' ? 'bg-green-600' :
            villa.status === 'For Sale' ? 'bg-blue-600' :
            villa.status === 'For Rent' ? 'bg-yellow-600' :
            villa.status === 'Sold' ? 'bg-red-600' : 'bg-gray-600'
          }`}>
            {villa.status || 'Available'}
          </span>
        </div>
        {onDelete && (
          <div className="absolute top-4 left-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
              title="Delete Villa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {villa.Name}
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
          {villa.Address}
        </p>
        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-bold text-blue-600">SAR {villa.price?.toLocaleString()}</p>
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
              {villa.length} x {villa.width} sqm
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{villa.description}</p>

        {/* Show assigned user info only for admin users */}
        {user?.role === 'admin' && villa.assignedUserId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-green-800 font-medium text-sm">Assigned to Owner</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              {villa.assignedUserFirstName} {villa.assignedUserLastName}
            </p>
            <p className="text-green-600 text-xs">{villa.assignedUserEmail}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {villa.features && villa.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
          {villa.features && villa.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">
              +{villa.features.length - 3} more
            </span>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Link
              to={`/admin/villas/${villa.villasId}`}
              className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              View Details
            </Link>
            <button
              onClick={onEdit}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition-colors duration-300"
              title="Edit Villa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
          {onAssign && user?.role === 'admin' && !villa.assignedUserId && (
            <button
              onClick={onAssign}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
              title="Assign Villa to Owner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              Assign to Owner
            </button>
          )}
          {user?.role === 'admin' && villa.assignedUserId && (
            <div className="w-full bg-gray-100 text-gray-600 font-medium py-2 px-4 rounded-md text-center">
              Already Assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VillaCard;
