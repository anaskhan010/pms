import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Select, Table } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import { ownerDataService } from "../../services/ownerDataService";

const OwnerBillingPage = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    property: "",
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ownerDataService.getOwnerTenants(user?.id);
      setTenants(response.data || []);
    } catch (err) {
      console.error("Error loading billing data:", err);
      setError("Failed to load billing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "current":
        return "bg-emerald-100 text-emerald-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const generateInvoiceNumber = (tenantId, month) => {
    const monthYear = new Date(month)
      .toISOString()
      .slice(0, 7)
      .replace("-", "");
    return `INV-${monthYear}-${tenantId.toString().padStart(3, "0")}`;
  };

  const columns = [
    {
      key: "tenant_info",
      title: "Tenant",
      render: (_, tenant) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-sm font-medium text-teal-700">
                {tenant.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {tenant.name}
            </div>
            <div className="text-sm text-gray-500">{tenant.property_name}</div>
            <div className="text-sm text-gray-500">
              Unit: {tenant.unit_number}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "invoice_info",
      title: "Invoice Details",
      render: (_, tenant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {generateInvoiceNumber(tenant.id, selectedMonth)}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(selectedMonth).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "amount_info",
      title: "Amount Details",
      render: (_, tenant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            SAR {tenant.monthly_rent?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Monthly Rent</div>
          <div className="text-sm text-gray-500">+ Service Charges</div>
        </div>
      ),
    },
    {
      key: "payment_status",
      title: "Payment Status",
      render: (_, tenant) => (
        <div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
              tenant.payment_status
            )}`}
          >
            {tenant.payment_status?.charAt(0).toUpperCase() +
              tenant.payment_status?.slice(1)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Due: {formatDate(tenant.next_payment)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, tenant) => (
        <div className="flex space-x-2">
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            Generate
          </button>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Send
          </button>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Download
          </button>
        </div>
      ),
    },
  ];

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.property_name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPaymentStatus =
      !filters.paymentStatus || tenant.payment_status === filters.paymentStatus;
    const matchesProperty =
      !filters.property || tenant.property_name.includes(filters.property);

    return matchesSearch && matchesPaymentStatus && matchesProperty;
  });

  const totalBilling = filteredTenants.reduce(
    (sum, tenant) => sum + (tenant.monthly_rent || 0),
    0
  );
  const paidAmount = filteredTenants
    .filter((t) => t.payment_status === "current")
    .reduce((sum, tenant) => sum + (tenant.monthly_rent || 0), 0);
  const overdueAmount = filteredTenants
    .filter((t) => t.payment_status === "overdue")
    .reduce((sum, tenant) => sum + (tenant.monthly_rent || 0), 0);
  const pendingAmount = filteredTenants
    .filter((t) => t.payment_status === "pending")
    .reduce((sum, tenant) => sum + (tenant.monthly_rent || 0), 0);

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
            Error Loading Billing Data
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadBillingData} variant="primary">
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
            Billing & Payments
          </h1>
          <p className="mt-2 text-gray-600">
            Generate invoices and track payment status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={useCallback((e) => setSelectedMonth(e.target.value), [])}
            className="form-input"
          />
          <Button
            onClick={loadBillingData}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">Generate All Bills</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${totalBilling.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Billing</div>
          <div className="text-xs text-blue-600 mt-1">
            {new Date(selectedMonth).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-3xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${paidAmount.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Collected</div>
          <div className="text-xs text-emerald-600 mt-1">
            {Math.round((paidAmount / totalBilling) * 100) || 0}% of total
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-red-50 to-pink-50">
          <div className="text-3xl font-bold text-red-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${overdueAmount.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Overdue</div>
          <div className="text-xs text-red-600 mt-1">Requires attention</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-3xl font-bold text-amber-600">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              `SAR ${pendingAmount.toLocaleString()}`
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pending</div>
          <div className="text-xs text-amber-600 mt-1">Awaiting payment</div>
        </Card>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search tenants or properties..."
            value={filters.search}
            onChange={useCallback(
              (e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value })),
              []
            )}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={useCallback(
              (e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                })),
              []
            )}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Payment Status</option>
            <option value="current">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Property
          </label>
          <input
            type="text"
            placeholder="Filter by property..."
            value={filters.property}
            onChange={useCallback(
              (e) =>
                setFilters((prev) => ({ ...prev, property: e.target.value })),
              []
            )}
            className="w-full bg-white text-black rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Billing Table */}
      <Card header={`Billing Records (${filteredTenants.length})`}>
        <Table
          columns={columns}
          data={filteredTenants}
          loading={loading}
          emptyMessage="No billing records found"
          variant="default"
        />
      </Card>

      {/* Payment Collection Progress */}
      <Card header="Payment Collection Progress">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Collection Progress</span>
            <span>
              {Math.round((paidAmount / totalBilling) * 100) || 0}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(paidAmount / totalBilling) * 100 || 0}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-emerald-600">Collected</div>
              <div className="text-gray-500">
                SAR {paidAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="font-medium text-amber-600">Pending</div>
              <div className="text-gray-500">
                SAR {pendingAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="font-medium text-red-600">Overdue</div>
              <div className="text-gray-500">
                SAR {overdueAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          header="Billing Actions"
          className="bg-gradient-to-br from-teal-50 to-blue-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Generate Monthly Bills
            </Button>
            <Button variant="secondary" fullWidth>
              Send Payment Reminders
            </Button>
            <Button variant="ghost" fullWidth>
              Bulk Invoice Download
            </Button>
          </div>
        </Card>

        <Card
          header="Payment Tracking"
          className="bg-gradient-to-br from-emerald-50 to-green-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Record Payment
            </Button>
            <Button variant="secondary" fullWidth>
              Payment History
            </Button>
            <Button variant="ghost" fullWidth>
              Late Fee Calculator
            </Button>
          </div>
        </Card>

        <Card
          header="Reports & Analytics"
          className="bg-gradient-to-br from-purple-50 to-indigo-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Monthly Report
            </Button>
            <Button variant="secondary" fullWidth>
              Collection Analytics
            </Button>
            <Button variant="ghost" fullWidth>
              Tax Summary
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card header="Recent Payment Transactions">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Sarah Al-Mansouri
                </div>
                <div className="text-sm text-gray-500">
                  Sunset Villa - February 2024
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-emerald-600">
                SAR 8,500
              </div>
              <div className="text-xs text-gray-500">2 days ago</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Mohammed Al-Ahmed
                </div>
                <div className="text-sm text-gray-500">
                  Al-Noor Complex - February 2024
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">SAR 2,400</div>
              <div className="text-xs text-gray-500">5 days ago</div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button variant="ghost">View All Transactions</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OwnerBillingPage;
