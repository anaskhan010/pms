import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Input, Select, Table } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import { ownerDataService } from "../../services/ownerDataService";

const OwnerMaintenancePage = () => {
  const { user } = useAuth();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("maintenance");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    property: "",
  });

  // Stable callback functions to prevent re-renders
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const handlePriorityChange = (e) => {
    setFilters((prev) => ({ ...prev, priority: e.target.value }));
  };

  const handlePropertyChange = (e) => {
    setFilters((prev) => ({ ...prev, property: e.target.value }));
  };

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [maintenanceResponse, complaintsResponse] = await Promise.all([
        ownerDataService.getMaintenanceRequests(user?.id),
        ownerDataService.getComplaints(user?.id),
      ]);
      setMaintenanceData(maintenanceResponse.data || []);
      setComplaintsData(complaintsResponse.data || []);
    } catch (err) {
      console.error("Error loading maintenance data:", err);
      setError("Failed to load maintenance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "resolved":
        return "bg-emerald-100 text-emerald-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "open":
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

  const maintenanceColumns = [
    {
      key: "issue",
      title: "Issue",
      render: (_, item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{item.issue}</div>
          <div className="text-sm text-gray-500">
            {item.property_name} - {item.unit_number}
          </div>
        </div>
      ),
    },
    {
      key: "tenant",
      title: "Tenant",
      render: (_, item) => (
        <div className="text-sm text-gray-900">{item.tenant_name}</div>
      ),
    },
    {
      key: "priority",
      title: "Priority",
      render: (_, item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
            item.priority
          )}`}
        >
          {item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            item.status
          )}`}
        >
          {item.status?.replace("_", " ").charAt(0).toUpperCase() +
            item.status?.replace("_", " ").slice(1)}
        </span>
      ),
    },
    {
      key: "assigned_to",
      title: "Assigned To",
      render: (_, item) => (
        <div className="text-sm text-gray-900">
          {item.assigned_to || "Unassigned"}
        </div>
      ),
    },
    {
      key: "cost",
      title: "Est. Cost",
      render: (_, item) => (
        <div className="text-sm font-medium text-gray-900">
          {item.estimated_cost ? `SAR ${item.estimated_cost}` : "TBD"}
        </div>
      ),
    },
    {
      key: "date",
      title: "Created",
      render: (_, item) => (
        <div className="text-sm text-gray-500">
          {formatDate(item.created_date)}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, item) => (
        <div className="flex space-x-2">
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            View
          </button>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Update
          </button>
        </div>
      ),
    },
  ];

  const complaintsColumns = [
    {
      key: "subject",
      title: "Subject",
      render: (_, item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {item.subject}
          </div>
          <div className="text-sm text-gray-500">{item.property_name}</div>
        </div>
      ),
    },
    {
      key: "tenant",
      title: "Tenant",
      render: (_, item) => (
        <div className="text-sm text-gray-900">{item.tenant_name}</div>
      ),
    },
    {
      key: "priority",
      title: "Priority",
      render: (_, item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
            item.priority
          )}`}
        >
          {item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            item.status
          )}`}
        >
          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
        </span>
      ),
    },
    {
      key: "created_date",
      title: "Created",
      render: (_, item) => (
        <div className="text-sm text-gray-500">
          {formatDate(item.created_date)}
        </div>
      ),
    },
    {
      key: "resolved_date",
      title: "Resolved",
      render: (_, item) => (
        <div className="text-sm text-gray-500">
          {item.resolved_date ? formatDate(item.resolved_date) : "-"}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, item) => (
        <div className="flex space-x-2">
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            View
          </button>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Respond
          </button>
        </div>
      ),
    },
  ];

  const currentData =
    activeTab === "maintenance" ? maintenanceData : complaintsData;
  const currentColumns =
    activeTab === "maintenance" ? maintenanceColumns : complaintsColumns;

  // Memoized filtered data to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    return currentData.filter((item) => {
      const matchesSearch =
        item.issue?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.property_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesPriority =
        !filters.priority || item.priority === filters.priority;
      const matchesProperty =
        !filters.property || item.property_name?.includes(filters.property);

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesProperty
      );
    });
  }, [
    currentData,
    filters.search,
    filters.status,
    filters.priority,
    filters.property,
  ]);

  const stats = {
    total_maintenance: maintenanceData.length,
    pending_maintenance: maintenanceData.filter((m) => m.status === "pending")
      .length,
    in_progress_maintenance: maintenanceData.filter(
      (m) => m.status === "in_progress"
    ).length,
    total_complaints: complaintsData.length,
    open_complaints: complaintsData.filter((c) => c.status === "open").length,
    resolved_complaints: complaintsData.filter((c) => c.status === "resolved")
      .length,
  };

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
            Error Loading Maintenance Data
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadMaintenanceData} variant="primary">
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
            Maintenance & Complaints
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage property maintenance requests and tenant complaints
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            onClick={loadMaintenanceData}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary">New Request</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-2xl font-bold text-blue-600">
            {loading ? (
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              stats.total_maintenance
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Maintenance</div>
          <div className="text-xs text-blue-600 mt-1">
            {stats.pending_maintenance} pending, {stats.in_progress_maintenance}{" "}
            in progress
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-2xl font-bold text-purple-600">
            {loading ? (
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              stats.total_complaints
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Complaints</div>
          <div className="text-xs text-purple-600 mt-1">
            {stats.open_complaints} open, {stats.resolved_complaints} resolved
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="text-2xl font-bold text-emerald-600">
            {loading ? (
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              Math.round(
                (stats.resolved_complaints / (stats.total_complaints || 1)) *
                  100
              )
            )}
            %
          </div>
          <div className="text-sm text-gray-500 mt-1">Resolution Rate</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-2xl font-bold text-amber-600">
            {loading ? (
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              maintenanceData
                .reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
                .toLocaleString()
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Est. Costs (SAR)</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "maintenance"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Maintenance Requests ({maintenanceData.length})
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "complaints"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Complaints ({complaintsData.length})
          </button>
        </nav>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={handleSearchChange}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />

        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: "", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "open", label: "Open" },
            { value: "resolved", label: "Resolved" },
          ]}
        />

        <Select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          options={[
            { value: "", label: "All Priorities" },
            { value: "high", label: "High Priority" },
            { value: "medium", label: "Medium Priority" },
            { value: "low", label: "Low Priority" },
          ]}
        />

        <Input
          placeholder="Filter by property..."
          value={filters.property}
          onChange={(e) => setFilters({ ...filters, property: e.target.value })}
        />
      </div>

      {/* Data Table */}
      <Card
        header={`${
          activeTab === "maintenance" ? "Maintenance Requests" : "Complaints"
        } (${filteredData.length})`}
      >
        <Table
          columns={currentColumns}
          data={filteredData}
          loading={loading}
          emptyMessage={`No ${
            activeTab === "maintenance" ? "maintenance requests" : "complaints"
          } found`}
          variant="default"
        />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          header="Quick Actions"
          className="bg-gradient-to-br from-teal-50 to-blue-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Create Work Order
            </Button>
            <Button variant="secondary" fullWidth>
              Schedule Inspection
            </Button>
            <Button variant="ghost" fullWidth>
              Export Report
            </Button>
          </div>
        </Card>

        <Card
          header="Vendor Management"
          className="bg-gradient-to-br from-purple-50 to-indigo-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Manage Vendors
            </Button>
            <Button variant="secondary" fullWidth>
              Request Quotes
            </Button>
            <Button variant="ghost" fullWidth>
              Vendor Performance
            </Button>
          </div>
        </Card>

        <Card
          header="Analytics"
          className="bg-gradient-to-br from-emerald-50 to-green-50"
        >
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Maintenance Trends
            </Button>
            <Button variant="secondary" fullWidth>
              Cost Analysis
            </Button>
            <Button variant="ghost" fullWidth>
              Response Times
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerMaintenancePage;
