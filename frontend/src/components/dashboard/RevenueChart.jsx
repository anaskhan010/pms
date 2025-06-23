import React from "react";
import Card from "../common/Card";

const RevenueChart = ({ data, loading = false }) => {
  // Find the maximum value to scale the chart
  const maxValue = Math.max(...data.map((item) => item.amount));

  return (
    <Card header="Monthly Revenue" loading={loading} className="h-full">
      <div className="flex items-end h-64 space-x-2">
        {data.map((item, index) => {
          const height = (item.amount / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full">
                <div
                  className={`w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "SAR",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{item.month}</div>
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
