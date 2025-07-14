import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { PermissionProvider } from "./contexts/PermissionContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect.jsx";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage.jsx";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import TenantsPage from "./components/tenant/TenantsPage";
import TenantDetailsPage from "./components/tenant/TenantDetailsPage";
import BuildingsPage from "./components/building/BuildingsPage";
import BuildingDetailsPage from "./components/building/BuildingDetailsPage";
import ApartmentDetailsPage from "./components/apartment/ApartmentDetailsPage";
import VendorsPage from "./components/vendor/VendorsPage";
import TransactionsPage from "./components/transaction/TransactionsPage";
import FinancialTransactionsPage from "./components/financial/FinancialTransactionsPage";
import VirtualDemoPage from "./components/virtual/VirtualDemoPage";
import VillasPage from "./components/villa/VillasPage";
import VillaDetailsPage from "./components/villa/VillaDetailsPage";
import MessagingPage from "./components/messaging/MessagingPage";
import UserManagementPage from "./components/user/UserManagementPage";
import PermissionManagementPage from "./components/permission/PermissionManagementPage";
import UserDetailsPage from "./components/user/UserDetailsPage";
import NotificationContainer from "./components/common/NotificationContainer";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <NotificationContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected admin routes - Permission-based access */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPermissions={["dashboard.view"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:id" element={<TenantDetailsPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="buildings/:id" element={<BuildingDetailsPage />} />
          <Route
            path="buildings/:buildingId/apartments/:apartmentId"
            element={<ApartmentDetailsPage />}
          />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="financial-transactions" element={<FinancialTransactionsPage />} />
          <Route path="virtual-demo" element={<VirtualDemoPage />} />
          <Route path="villas" element={<VillasPage />} />
          <Route path="villas/:id" element={<VillaDetailsPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="user-management/:id" element={<UserDetailsPage />} />
          <Route path="permissions" element={<PermissionManagementPage />} />
          <Route path="messages" element={<MessagingPage />} />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
