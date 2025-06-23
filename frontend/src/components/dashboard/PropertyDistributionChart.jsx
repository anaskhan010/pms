import React from "react";
import Card from "../common/Card";

const PropertyDistributionChart = ({ buildings, villas, loading = false }) => {
  const total = buildings + villas;
  const buildingsPercentage = Math.round((buildings / total) * 100);
  const villasPercentage = 100 - buildingsPercentage;

  return (
    <Card header="Property Distribution" loading={loading} className="h-full">
      {/* Pie chart representation */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Buildings slice */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="20"
          />

          {/* Calculate the circumference */}
          {(() => {
            const radius = 40;
            const circumference = 2 * Math.PI * radius;

            // Calculate the dash offset for each segment
            const buildingsDash = (circumference * buildingsPercentage) / 100;
            const villasDash = (circumference * villasPercentage) / 100;

            return (
              <>
                {/* Buildings slice */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#0F766E"
                  strokeWidth="20"
                  strokeDasharray={`${buildingsDash} ${
                    circumference - buildingsDash
                  }`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />

                {/* Villas slice */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#7E22CE"
                  strokeWidth="20"
                  strokeDasharray={`${villasDash} ${
                    circumference - villasDash
                  }`}
                  strokeDashoffset={`${-buildingsDash}`}
                  transform="rotate(-90 50 50)"
                />
              </>
            );
          })()}

          {/* Center text */}
          <text
            x="50"
            y="45"
            textAnchor="middle"
            fill="#374151"
            fontSize="16"
            fontWeight="bold"
          >
            {total}
          </text>
          <text x="50" y="65" textAnchor="middle" fill="#6b7280" fontSize="10">
            Properties
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-teal-600 mr-2"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Buildings</p>
            <p className="text-lg font-bold text-gray-900">
              {buildings}{" "}
              <span className="text-sm text-gray-500">
                ({buildingsPercentage}%)
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-600 mr-2"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Villas</p>
            <p className="text-lg font-bold text-gray-900">
              {villas}{" "}
              <span className="text-sm text-gray-500">
                ({villasPercentage}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Total properties */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">Total Properties</p>
        <p className="text-2xl font-bold text-gray-800">{total}</p>
      </div>
    </Card>
  );
};

export default PropertyDistributionChart;
