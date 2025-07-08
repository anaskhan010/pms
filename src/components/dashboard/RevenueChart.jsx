import React from "react";
import Card from "../common/Card";

const RevenueChart = ({ data, loading = false }) => {
  // Handle both revenue data and tenant registration trends
  const chartData = data || [];

  // If data has 'registrations' field, it's tenant trends data
  const isRegistrationData = chartData.length > 0 && chartData[0].hasOwnProperty('registrations');

  // Find the maximum value to scale the chart
  const maxValue = chartData.length > 0
    ? Math.max(...chartData.map((item) => isRegistrationData ? item.registrations : item.amount))
    : 1;

  return (
    <Card
      header={isRegistrationData ? "Tenant Registration Trends" : "Monthly Revenue"}
      loading={loading}
      className="h-full"
    >
      <div className="flex items-end h-64 space-x-2">
        {chartData.map((item, index) => {
          const value = isRegistrationData ? item.registrations : item.amount;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full">
                <div
                  className={`w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {isRegistrationData
                      ? `${value} registrations`
                      : value.toLocaleString("en-US", {
                          style: "currency",
                          currency: "SAR",
                        })
                    }
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {isRegistrationData ? item.month : item.month}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Revenue (YTD)</p>
            <p className="text-2xl font-bold text-gray-800">
              {data
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString("en-US", {
                  style: "currency",
                  currency: "SAR",
                })}
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
            <span className="text-sm text-gray-600">Monthly Revenue</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RevenueChart;
