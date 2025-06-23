import React, { useState, useEffect, useCallback } from "react";
import { Card, Button } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "../dashboard/StatCard";
import RevenueChart from "../dashboard/RevenueChart";
import OccupancyChart from "../dashboard/OccupancyChart";
import PropertyDistributionChart from "../dashboard/PropertyDistributionChart";

/**
 * Manager Reports Page Component
 * Comprehensive financial and operational reports for managers
 */
const ManagerReportsPage = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    summary: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      occupancyRate: 0,
      totalProperties: 0,
      totalUnits: 0,
      activeContracts: 0,
      pendingPayments: 0,
    },
    revenueData: [],
    occupancyData: [],
    propertyDistribution: [],
    loading: true,
    error: null,
  });
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // Load report data
  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedYear]);

  const loadReportData = async () => {
    try {
      setReportData((prev) => ({ ...prev, loading: true, error: null }));

      // Mock data for now - replace with actual API calls
      const mockData = {
        summary: {
          totalRevenue: 1250000,
          monthlyRevenue: 485000,
          yearlyRevenue: 5820000,
          occupancyRate: 86.7,
          totalProperties: 45,
          totalUnits: 180,
          activeContracts: 142,
          pendingPayments: 12,
        },
        revenueData: [
          { month: "Jan", revenue: 420000, expenses: 85000, profit: 335000 },
          { month: "Feb", revenue: 445000, expenses: 89000, profit: 356000 },
          { month: "Mar", revenue: 465000, expenses: 93000, profit: 372000 },
          { month: "Apr", revenue: 485000, expenses: 97000, profit: 388000 },
          { month: "May", revenue: 475000, expenses: 95000, profit: 380000 },
          { month: "Jun", revenue: 490000, expenses: 98000, profit: 392000 },
          { month: "Jul", revenue: 510000, expenses: 102000, profit: 408000 },
          { month: "Aug", revenue: 495000, expenses: 99000, profit: 396000 },
          { month: "Sep", revenue: 480000, expenses: 96000, profit: 384000 },
          { month: "Oct", revenue: 485000, expenses: 97000, profit: 388000 },
          { month: "Nov", revenue: 470000, expenses: 94000, profit: 376000 },
          { month: "Dec", revenue: 455000, expenses: 91000, profit: 364000 },
        ],
        occupancyData: [
          { month: "Jan", occupied: 85, vacant: 15 },
          { month: "Feb", occupied: 88, vacant: 12 },
          { month: "Mar", occupied: 82, vacant: 18 },
          { month: "Apr", occupied: 90, vacant: 10 },
          { month: "May", occupied: 87, vacant: 13 },
          { month: "Jun", occupied: 86, vacant: 14 },
          { month: "Jul", occupied: 89, vacant: 11 },
          { month: "Aug", occupied: 91, vacant: 9 },
          { month: "Sep", occupied: 88, vacant: 12 },
          { month: "Oct", occupied: 86, vacant: 14 },
          { month: "Nov", occupied: 84, vacant: 16 },
          { month: "Dec", occupied: 87, vacant: 13 },
        ],
        propertyDistribution: [
          { name: "Apartments", value: 25, color: "#0891b2" },
          { name: "Villas", value: 12, color: "#059669" },
          { name: "Commercial", value: 8, color: "#dc2626" },
        ],
      };

      setReportData((prev) => ({
        ...prev,
        ...mockData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading report data:", error);
      setReportData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load report data",
      }));
    }
  };

  // Handle period change - memoized to prevent input focus loss
  const handlePeriodChange = useCallback((e) => {
    setSelectedPeriod(e.target.value);
  }, []);

  // Handle year change - memoized to prevent input focus loss
  const handleYearChange = useCallback((e) => {
    setSelectedYear(e.target.value);
  }, []);

  // Export report functionality
  const handleExportReport = (format) => {
    // Implement export functionality
    alert(`Exporting report in ${format} format...`);
  };

  const {
    summary,
    revenueData,
    occupancyData,
    propertyDistribution,
    loading,
    error,
  } = reportData;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadReportData} variant="primary">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-teal-100 mt-2">
              Comprehensive financial and operational analytics
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => handleExportReport("PDF")}
            >
              Export PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExportReport("Excel")}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Period Field */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Report Period
            </label>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Year Field */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReportData}
              className="w-full"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${summary.totalRevenue.toLocaleString()}`}
          icon="credit-card"
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${summary.monthlyRevenue.toLocaleString()}`}
          icon="chart"
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${summary.occupancyRate}%`}
          icon="home"
          color="purple"
          trend={{ value: 2.3, isPositive: true }}
        />
        <StatCard
          title="Active Contracts"
          value={summary.activeContracts}
          icon="document"
          color="teal"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={summary.totalProperties}
          icon="building"
          color="orange"
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Total Units"
          value={summary.totalUnits}
          icon="grid"
          color="indigo"
          trend={{ value: 7, isPositive: true }}
        />
        <StatCard
          title="Yearly Revenue"
          value={`$${summary.yearlyRevenue.toLocaleString()}`}
          icon="trending-up"
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pending Payments"
          value={summary.pendingPayments}
          icon="clock"
          color="yellow"
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trends
          </h3>
          <RevenueChart data={revenueData} />
        </Card>

        {/* Property Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Distribution
          </h3>
          <PropertyDistributionChart data={propertyDistribution} />
        </Card>
      </div>

      {/* Occupancy Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Occupancy Trends
        </h3>
        <OccupancyChart data={occupancyData} />
      </Card>

      {/* Detailed Reports Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Financial Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.expenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ${item.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((item.profit / item.revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Report Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => handleExportReport("PDF")}
            className="flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download PDF Report</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExportReport("Excel")}
            className="flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export to Excel</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ManagerReportsPage;
