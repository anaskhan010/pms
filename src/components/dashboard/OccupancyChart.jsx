import React from "react";
import Card from "../common/Card";

const OccupancyChart = ({ occupied, vacant, data, loading = false }) => {
  // Handle both old format (occupied, vacant) and new format (data from API)
  let totalOccupied = occupied || 0;
  let totalVacant = vacant || 0;

  if (data && Array.isArray(data) && data.length > 0) {
    // Calculate totals from occupancy analytics data
    totalOccupied = data.reduce((sum, property) => sum + (property.occupied_units || 0), 0);
    const totalUnits = data.reduce((sum, property) => sum + (property.total_units || 0), 0);
    totalVacant = totalUnits - totalOccupied;
  }

  const total = totalOccupied + totalVacant;
  const occupiedPercentage = total > 0 ? Math.round((totalOccupied / total) * 100) : 0;
  const vacantPercentage = 100 - occupiedPercentage;

  return (
    <Card header="Apartment Occupancy" loading={loading} className="h-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Occupancy Rate
        </span>
        <span className="text-sm font-bold text-gray-900">
          {occupiedPercentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-teal-600 h-4 rounded-full"
          style={{ width: `${occupiedPercentage}%` }}
        ></div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-teal-600 mr-2"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Occupied</p>
            <p className="text-lg font-bold text-gray-900">
              {totalOccupied} <span className="text-sm text-gray-500">units</span>
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Vacant</p>
            <p className="text-lg font-bold text-gray-900">
              {totalVacant} <span className="text-sm text-gray-500">units</span>
            </p>
          </div>
        </div>
      </div>

      {/* Donut chart with SVG */}
      <div className="relative w-48 h-48 mx-auto mt-4">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="3"
          />

          {/* Occupied percentage arc */}
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#0F766E"
            strokeWidth="3"
            strokeDasharray={`${occupiedPercentage} ${vacantPercentage}`}
            strokeDashoffset="25"
            transform="rotate(-90 18 18)"
          />

          {/* Center text */}
          <text
            x="18"
            y="17"
            textAnchor="middle"
            fill="#1f2937"
            fontSize="6"
            fontWeight="bold"
          >
            {occupiedPercentage}%
          </text>
          <text x="18" y="22" textAnchor="middle" fill="#6b7280" fontSize="2.5">
            Occupied
          </text>
        </svg>
      </div>
    </Card>
  );
};

export default OccupancyChart;
