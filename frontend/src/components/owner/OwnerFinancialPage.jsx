import React, { useState, useEffect } from "react";
import { Card, Button, Select } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import { ownerDataService } from "../../services/ownerDataService";

const OwnerFinancialPage = () => {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ownerDataService.getFinancialOverview(user?.id);
      setFinancialData(response.data);
    } catch (err) {
      console.error("Error loading financial data:", err);
      setError("Failed to load financial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mock monthly data for charts
  const monthlyData = [
    { month: "Jan", income: 110000, expenses: 15000 },
    { month: "Feb", income: 116500, expenses: 18000 },
    { month: "Mar", income: 112000, expenses: 12000 },
    { month: "Apr", income: 118000, expenses: 20000 },
    { month: "May", income: 115000, expenses: 16000 },
    { month: "Jun", income: 120000, expenses: 14000 },
    { month: "Jul", income: 116500, expenses: 17000 },
    { month: "Aug", income: 119000, expenses: 15000 },
    { month: "Sep", income: 117000, expenses: 19000 },
    { month: "Oct", income: 121000, expenses: 13000 },
    { month: "Nov", income: 116500, expenses: 16000 },
    { month: "Dec", income: 118000, expenses: 18000 },
  ];

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const totalYearlyIncome = monthlyData.reduce(
    (sum, month) => sum + month.income,
    0
  );
  const totalYearlyExpenses = monthlyData.reduce(
    (sum, month) => sum + month.expenses,
    0
  );
  const netIncome = totalYearlyIncome - totalYearlyExpenses;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Financial Data
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadFinancialData} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Reports
          </h1>
          <p className="mt-2 text-gray-600">
            Track income, expenses, and portfolio performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
            <option value="yearly">Yearly View</option>
          </select>
          <Button
            onClick={loadFinancialData}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${financialData?.monthly_income?.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Monthly Income</div>
          <div className="text-xs text-emerald-600 mt-1">
            +8.2% vs last month
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalYearlyIncome.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Yearly Income</div>
          <div className="text-xs text-blue-600 mt-1">+12.5% vs last year</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-3xl font-bold text-amber-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalYearlyExpenses.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Yearly Expenses</div>
          <div className="text-xs text-amber-600 mt-1">+5.1% vs last year</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${netIncome.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Net Income</div>
          <div className="text-xs text-purple-600 mt-1">
            +15.3% vs last year
          </div>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card header={`Income vs Expenses - ${selectedYear}`}>
        <div className="h-80 flex items-end justify-between space-x-2 p-4">
          {monthlyData.map((data, index) => {
            const maxValue = Math.max(
              ...monthlyData.map((d) => Math.max(d.income, d.expenses))
            );
            const incomeHeight = (data.income / maxValue) * 100;
            const expenseHeight = (data.expenses / maxValue) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center space-y-2"
              >
                <div
                  className="w-full flex space-x-1 items-end"
                  style={{ height: "200px" }}
                >
                  <div
                    className="bg-emerald-500 rounded-t flex-1 min-h-[4px] transition-all duration-500 hover:bg-emerald-600"
                    style={{ height: `${incomeHeight}%` }}
                    title={`Income: SAR ${data.income.toLocaleString()}`}
                  ></div>
                  <div
                    className="bg-red-400 rounded-t flex-1 min-h-[4px] transition-all duration-500 hover:bg-red-500"
                    style={{ height: `${expenseHeight}%` }}
                    title={`Expenses: SAR ${data.expenses.toLocaleString()}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-gray-600">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-sm text-gray-600">Expenses</span>
          </div>
        </div>
      </Card>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header="Income Breakdown">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-gray-700">Rental Income</span>
              <span className="font-semibold text-emerald-600">
                SAR {financialData?.monthly_income?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Parking Fees</span>
              <span className="font-semibold text-blue-600">SAR 2,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Service Charges</span>
              <span className="font-semibold text-purple-600">SAR 1,800</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span className="text-gray-700">Late Fees</span>
              <span className="font-semibold text-amber-600">SAR 500</span>
            </div>
          </div>
        </Card>

        <Card header="Expense Breakdown">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Maintenance</span>
              <span className="font-semibold text-red-600">SAR 8,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Utilities</span>
              <span className="font-semibold text-orange-600">SAR 3,200</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Insurance</span>
              <span className="font-semibold text-yellow-600">SAR 2,100</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Management Fees</span>
              <span className="font-semibold text-gray-600">SAR 1,500</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Property Performance */}
      <Card header="Property Performance">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Al-Noor Residential Complex
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  SAR 48,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  83.3%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  8.2%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Excellent
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Sunset Villa
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  SAR 8,500
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  100%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  12.0%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Excellent
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Golden Plaza Shops
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  SAR 32,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  75%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  6.8%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                    Good
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          header="Generate Reports"
          className="bg-gradient-to-br from-blue-50 to-indigo-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Monthly Report
            </Button>
            <Button variant="secondary" fullWidth>
              Quarterly Report
            </Button>
            <Button variant="ghost" fullWidth>
              Tax Summary
            </Button>
          </div>
        </Card>

        <Card
          header="Financial Actions"
          className="bg-gradient-to-br from-emerald-50 to-green-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Record Expense
            </Button>
            <Button variant="secondary" fullWidth>
              Track Payment
            </Button>
            <Button variant="ghost" fullWidth>
              Set Budget
            </Button>
          </div>
        </Card>

        <Card
          header="Analysis Tools"
          className="bg-gradient-to-br from-purple-50 to-pink-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              ROI Calculator
            </Button>
            <Button variant="secondary" fullWidth>
              Cash Flow Analysis
            </Button>
            <Button variant="ghost" fullWidth>
              Market Comparison
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerFinancialPage;
