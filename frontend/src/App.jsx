import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect.jsx";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage.jsx";
import HomePage from "./components/dashboard/HomePage";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import TenantsPage from "./components/tenant/TenantsPage";
import BuildingsPage from "./components/building/BuildingsPage";
import BuildingDetailsPage from "./components/building/BuildingDetailsPage";
import ApartmentDetailsPage from "./components/apartment/ApartmentDetailsPage";
import VendorsPage from "./components/vendor/VendorsPage";
import TransactionsPage from "./components/transaction/TransactionsPage";
import VirtualDemoPage from "./components/virtual/VirtualDemoPage";
import VillasPage from "./components/villa/VillasPage";
import VillaDetailsPage from "./components/villa/VillaDetailsPage";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import OwnerPropertiesPage from "./components/owner/OwnerPropertiesPage";
import OwnerPropertyDetails from "./components/owner/OwnerPropertyDetails";
import OwnerTenantsPage from "./components/owner/OwnerTenantsPage";
import OwnerTenantDetails from "./components/owner/OwnerTenantDetails";
import OwnerFinancialPage from "./components/owner/OwnerFinancialPage";
import OwnerMaintenancePage from "./components/owner/OwnerMaintenancePage";
import OwnerBillingPage from "./components/owner/OwnerBillingPage";
import TenantDashboard from "./components/tenant/TenantDashboard";
import TenantPropertiesPage from "./components/tenant/TenantPropertiesPage";
import TenantLeaseManagement from "./components/tenant/TenantLeaseManagement";
import TenantPaymentCenter from "./components/tenant/TenantPaymentCenter";
import TenantBillsPage from "./components/tenant/TenantBillsPage";
import TenantMaintenancePage from "./components/tenant/TenantMaintenancePage";
import TenantDocumentsPage from "./components/tenant/TenantDocumentsPage";
import MessagingPage from "./components/messaging/MessagingPage";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import ManagerPropertiesPage from "./components/manager/ManagerPropertiesPage";
import ManagerUnitsPage from "./components/manager/ManagerUnitsPage";
import ManagerTenantsPage from "./components/manager/ManagerTenantsPage";
import ManagerOwnersPage from "./components/manager/ManagerOwnersPage";
import ManagerContractsPage from "./components/manager/ManagerContractsPage";
import ManagerReportsPage from "./components/manager/ManagerReportsPage";
import NotificationContainer from "./components/common/NotificationContainer";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <NotificationContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected tenant route */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRoles={["tenant"]}>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={["admin", "super_admin", "manager"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="buildings/:id" element={<BuildingDetailsPage />} />
          <Route
            path="buildings/:buildingId/apartments/:apartmentId"
            element={<ApartmentDetailsPage />}
          />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="virtual-demo" element={<VirtualDemoPage />} />
          <Route path="villas" element={<VillasPage />} />
          <Route path="villas/:id" element={<VillaDetailsPage />} />
          <Route path="messages" element={<MessagingPage />} />
        </Route>

        {/* Protected owner routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRoles={["owner"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="properties" element={<OwnerPropertiesPage />} />
          <Route path="properties/:id" element={<OwnerPropertyDetails />} />
          <Route path="tenants" element={<OwnerTenantsPage />} />
          <Route path="tenants/:id" element={<OwnerTenantDetails />} />
          <Route path="financial" element={<OwnerFinancialPage />} />
          <Route path="maintenance" element={<OwnerMaintenancePage />} />
          <Route path="billing" element={<OwnerBillingPage />} />
          <Route path="messages" element={<MessagingPage />} />
        </Route>

        {/* Protected manager routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRoles={["manager"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="properties" element={<ManagerPropertiesPage />} />
          <Route path="units" element={<ManagerUnitsPage />} />
          <Route path="tenants" element={<ManagerTenantsPage />} />
          <Route path="owners" element={<ManagerOwnersPage />} />
          <Route path="contracts" element={<ManagerContractsPage />} />
          <Route path="reports" element={<ManagerReportsPage />} />
          <Route path="messages" element={<MessagingPage />} />
        </Route>

        {/* Protected tenant routes */}
        <Route
          path="/tenant"
          element={
            <ProtectedRoute requiredRoles={["tenant"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TenantDashboard />} />
          <Route path="properties" element={<TenantPropertiesPage />} />
          <Route path="lease" element={<TenantLeaseManagement />} />
          <Route path="payments" element={<TenantPaymentCenter />} />
          <Route path="bills" element={<TenantBillsPage />} />
          <Route path="maintenance" element={<TenantMaintenancePage />} />
          <Route path="documents" element={<TenantDocumentsPage />} />
          <Route path="messages" element={<MessagingPage />} />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
