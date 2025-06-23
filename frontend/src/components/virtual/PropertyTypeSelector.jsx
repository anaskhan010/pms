import React from "react";

const PropertyTypeSelector = ({ activeType, onTypeChange }) => {
  return (
    <div className="mb-8">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center px-6 py-3 rounded-t-lg transition-colors ${
            activeType === "buildings"
              ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => onTypeChange("buildings")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="font-medium">Buildings & Apartments</span>
        </button>
        <button
          className={`flex items-center px-6 py-3 rounded-t-lg transition-colors ${
            activeType === "villas"
              ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => onTypeChange("villas")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
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
          <span className="font-medium">Luxury Villas</span>
        </button>
      </div>
    </div>
  );
};

export default PropertyTypeSelector;
