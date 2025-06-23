import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, Select } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import { tenantDataService } from "../../services/tenantDataService";

const TenantBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantDataService.getUtilityBills(user?.id);
      setBills(response.data || []);
    } catch (err) {
      console.error("Error loading bills:", err);
      setError("Failed to load utility bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBillTypeIcon = (type) => {
    switch (type) {
      case "electricity":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "water":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
            />
          </svg>
        );
      case "internet":
        return (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  const columns = [
    {
      key: "bill_type",
      title: "Type",
      render: (_, bill) => (
        <div className="flex items-center space-x-3">
          {getBillTypeIcon(bill.bill_type)}
          <div>
            <div className="text-sm font-medium text-gray-900 capitalize">
              {bill.bill_type}
            </div>
            <div className="text-sm text-gray-500">{bill.provider}</div>
          </div>
        </div>
      ),
    },
    {
      key: "billing_period",
      title: "Period",
      render: (_, bill) => (
        <div className="text-sm text-gray-900">{bill.billing_period}</div>
      ),
    },
    {
      key: "consumption",
      title: "Usage",
      render: (_, bill) => (
        <div className="text-sm text-gray-900">
          {bill.consumption} {bill.unit}
        </div>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      render: (_, bill) => (
        <div className="text-sm font-medium text-gray-900">
          SAR {bill.amount}
        </div>
      ),
    },
    {
      key: "due_date",
      title: "Due Date",
      render: (_, bill) => (
        <div className="text-sm text-gray-900">{formatDate(bill.due_date)}</div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, bill) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            bill.status
          )}`}
        >
          {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, bill) => (
        <div className="flex space-x-2">
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            View
          </button>
          {bill.status === "pending" && (
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Pay
            </button>
          )}
        </div>
      ),
    },
  ];

  const filteredBills = bills.filter((bill) => {
    if (filter === "all") return true;
    return bill.status === filter;
  });

  const totalPending = bills
    .filter((b) => b.status === "pending")
    .reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, bill) => sum + bill.amount, 0);
  const pendingCount = bills.filter((b) => b.status === "pending").length;

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
            Error Loading Bills
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadBills} variant="primary">
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
            Bills & Utilities
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage your utility bills and service charges
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadBills}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">Pay All Pending</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-3xl font-bold text-amber-600">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              pendingCount
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pending Bills</div>
          <div className="text-xs text-amber-600 mt-1">Requires payment</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-red-50 to-pink-50">
          <div className="text-3xl font-bold text-red-600">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalPending}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Amount Due</div>
          <div className="text-xs text-red-600 mt-1">Total pending</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalPaid}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Paid This Year</div>
          <div className="text-xs text-emerald-600 mt-1">2024</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              bills.length
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Bills</div>
          <div className="text-xs text-blue-600 mt-1">All time</div>
        </Card>
      </div>

      {/* Pending Bills Alert */}
      {!loading && pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-900">
                {pendingCount} Pending Bill{pendingCount > 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                You have SAR {totalPending} in pending utility bills. Pay them
                before the due date to avoid late fees.
              </p>
            </div>
            <Button variant="primary" size="sm">
              Pay Now
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Bills Table */}
      <Card
        header={
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Utility Bills
            </h3>
            <select
              value={filter}
              onChange={useCallback((e) => setFilter(e.target.value), [])}
              className="bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Bills</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        }
      >
        <Table
          columns={columns}
          data={filteredBills}
          loading={loading}
          emptyMessage="No bills found"
          variant="default"
        />
      </Card>

      {/* Bill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          header="Electricity (DEWA)"
          className="bg-gradient-to-br from-yellow-50 to-amber-50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Month</span>
              <span className="font-semibold text-yellow-700">SAR 180</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usage</span>
              <span className="text-sm text-gray-900">450 kWh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="text-sm text-gray-900">Feb 15, 2024</span>
            </div>
            <Button variant="secondary" size="sm" fullWidth>
              View Details
            </Button>
          </div>
        </Card>

        <Card
          header="Water (DEWA)"
          className="bg-gradient-to-br from-blue-50 to-cyan-50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Month</span>
              <span className="font-semibold text-blue-700">SAR 85</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usage</span>
              <span className="text-sm text-gray-900">12 m³</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="text-sm text-gray-900">Feb 15, 2024</span>
            </div>
            <Button variant="secondary" size="sm" fullWidth>
              View Details
            </Button>
          </div>
        </Card>

        <Card
          header="Internet (Etisalat)"
          className="bg-gradient-to-br from-purple-50 to-indigo-50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Month</span>
              <span className="font-semibold text-purple-700">SAR 299</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="text-sm text-gray-900">Unlimited</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                Paid
              </span>
            </div>
            <Button variant="ghost" size="sm" fullWidth>
              View Details
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment Tips */}
      <Card header="Payment Tips & Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Online banking transfer</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>DEWA/Etisalat mobile apps</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Payment kiosks</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Customer service centers</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Important Notes</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Bills are typically issued monthly</li>
              <li>• Payment due dates are usually 15 days from issue</li>
              <li>• Late payments may incur additional charges</li>
              <li>• Keep payment receipts for your records</li>
              <li>• Contact providers for payment plan options</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TenantBillsPage;
