import { Link } from "react-router-dom";
import OccupancyChart from "./OccupancyChart";
import RevenueChart from "./RevenueChart";
import PropertyDistributionChart from "./PropertyDistributionChart";
import RecentActivities from "./RecentActivities";
import StatCard from "./StatCard";
import { Card } from "../common";

const AdminDashboard = () => {
  // Sample stats data
  const stats = [
    {
      title: "Total Buildings",
      value: 8,
      icon: "building",
      color: "teal",
      link: "/admin/buildings",
    },
    {
      title: "Total Apartments",
      value: 120,
      icon: "home",
      color: "emerald",
      link: "/admin/buildings",
      subValue: "102 Rented, 18 Vacant",
    },
    {
      title: "Total Villas",
      value: 15,
      icon: "home",
      color: "purple",
      link: "/admin/villas",
    },
    {
      title: "Total Tenants",
      value: 117,
      icon: "users",
      color: "indigo",
      link: "/admin/tenants",
    },
    {
      title: "Total Vendors",
      value: 24,
      icon: "briefcase",
      color: "amber",
      link: "/admin/vendors",
    },
    {
      title: "Monthly Revenue",
      value: "SAR 152,000",
      icon: "cash",
      color: "rose",
      link: "/admin/transactions",
    },
  ];

  // Sample revenue data
  const revenueData = [
    { month: "Jan", amount: 125000 },
    { month: "Feb", amount: 132000 },
    { month: "Mar", amount: 141000 },
    { month: "Apr", amount: 138000 },
    { month: "May", amount: 145000 },
    { month: "Jun", amount: 152000 },
  ];

  // Recent transactions
  const recentTransactions = [
    {
      id: 1,
      date: "2023-06-15",
      tenant: "Mohammed Al-Saud",
      property: "A-101, Al Faisaliah Residences",
      type: "Rent Payment",
      amount: "SAR 12,500",
      status: "Completed",
    },
    {
      id: 2,
      date: "2023-06-14",
      tenant: "Sarah Al-Qahtani",
      property: "B-205, Kingdom Tower Apartments",
      type: "Security Deposit",
      amount: "SAR 15,000",
      status: "Completed",
    },
    {
      id: 3,
      date: "2023-06-12",
      tenant: "Ahmed Al-Ghamdi",
      property: "Villa #3, Al Mamlaka Villas",
      type: "Maintenance Fee",
      amount: "SAR 1,200",
      status: "Pending",
    },
    {
      id: 4,
      date: "2023-06-10",
      tenant: "Fatima Al-Otaibi",
      property: "C-310, Red Sea Residence",
      type: "Utility Payment",
      amount: "SAR 850",
      status: "Completed",
    },
  ];

  // Recent activities
  const activities = [
    {
      id: 1,
      type: "tenant_added",
      activity: "New tenant added",
      date: "2 hours ago",
      details:
        "Mohammed Al-Saud has been added as a tenant for Apartment A-101 in Al Faisaliah Residences.",
    },
    {
      id: 2,
      type: "maintenance",
      activity: "Maintenance request",
      date: "5 hours ago",
      details: "Plumbing issue reported in Kingdom Tower Apartments, Floor 3.",
    },
    {
      id: 3,
      type: "lease_renewal",
      activity: "Lease renewal",
      date: "1 day ago",
      details: "Sarah Al-Qahtani renewed her lease for another year.",
    },
    {
      id: 4,
      type: "payment",
      activity: "Payment received",
      date: "2 days ago",
      details: "Ahmed Al-Ghamdi made a payment of SAR 12,500 for monthly rent.",
    },
    {
      id: 5,
      type: "property_added",
      activity: "New property added",
      date: "3 days ago",
      details:
        "A new villa has been added to the system: Villa #15 in Al Mamlaka Villas.",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            link={stat.link}
            subValue={stat.subValue}
            subLabel="Details"
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OccupancyChart occupied={102} vacant={18} />
        <RevenueChart data={revenueData} />
        <PropertyDistributionChart buildings={8} villas={15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card
          header={
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Transactions
              </h3>
              <Link
                to="/admin/transactions"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
          }
          className="h-fit"
        >
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Tenant</th>
                  <th className="table-header-cell">Property</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="table-row">
                    <td className="table-cell-secondary">{transaction.date}</td>
                    <td className="table-cell">{transaction.tenant}</td>
                    <td className="table-cell-secondary">
                      {transaction.property}
                    </td>
                    <td className="table-cell-secondary">{transaction.type}</td>
                    <td className="table-cell font-semibold">
                      {transaction.amount}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : transaction.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activities */}
        <RecentActivities activities={activities} />
      </div>
    </div>
  );
};

export default AdminDashboard;
