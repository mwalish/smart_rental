import { useRoutes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";

// Landlord Pages
import PropertiesPage from "./pages/landlord/PropertiesPage";
import TenantsPage from "./pages/landlord/TenantsPage";
import LandlordMaintenancePage from "./pages/landlord/MaintenancePage";
import PaymentsPage from "./pages/landlord/PaymentsPage";
import LeasesPage from "./pages/landlord/LeasesPage";
import RequestsPage from "./pages/landlord/RequestsPage";
import MeetingsPage from "./pages/landlord/MeetingsPage";
import NoticesPage from "./pages/landlord/NoticesPage";
import RegisterTenantPage from "./pages/landlord/RegisterTenantPage";

// Tenant Pages (Main Portal)
import MyPropertyPage from "./pages/tenant/MyPropertyPage";
import TenantPaymentsPage from "./pages/tenant/TenantPaymentsPage";
import TenantMaintenancePage from "./pages/tenant/MaintenancePage";
import TenantRentalRequestsPage from "./pages/tenant/TenantRentalRequestsPage";
import TenantNoticesPage from "./pages/tenant/TenantNoticesPage";

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCreateLandlordPage from './pages/admin/AdminCreateLandlordPage'
import AdminLeasesPage from './pages/admin/AdminLeasesPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage'
import AdminNoticesPage from './pages/admin/AdminNoticesPage'

// House-Hunting Pages
import ListingsPage from "./pages/househunting/ListingsPage";
import PropertyDetailPage from "./pages/househunting/PropertyDetailPage";
import TenantDashboardPage from "./pages/househunting/TenantDashboardPage";
import MyRequestsPage from "./pages/househunting/MyRequestsPage";
import RegisterPage from "./pages/househunting/RegisterPage";

export default function App() {
  const routes = useRoutes([
    { path: '/', element: <LandingPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/not-authorized', element: <NotAuthorized /> },

    // =====================
    // HOUSE-HUNTING PORTAL (Public / Tenant-Facing)
    // =====================

    // Public routes — no login required
    { path: '/houses', element: <ListingsPage /> },
    { path: '/houses/register', element: <RegisterPage /> },
    { path: '/houses/:id', element: <PropertyDetailPage /> },

    // Protected routes — tenant must be logged in
    {
      path: '/houses/dashboard',
      element: <ProtectedRoute allowedRoles={['tenant']}><TenantDashboardPage /></ProtectedRoute>
    },
    {
      path: '/houses/my-requests',
      element: <ProtectedRoute allowedRoles={['tenant']}><MyRequestsPage /></ProtectedRoute>
    },

    // =====================
    // LANDLORD / ADMIN PORTAL (Private)
    // =====================

    // Shared Dashboard
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
          <DashboardPage />
        </ProtectedRoute>
      )
    },

    // Landlord Only Routes
    {
      path: '/dashboard/properties',
      element: <ProtectedRoute allowedRoles={['landlord']}><PropertiesPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/tenants',
      element: <ProtectedRoute allowedRoles={['landlord']}><TenantsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/maintenance',
      element: <ProtectedRoute allowedRoles={['landlord']}><LandlordMaintenancePage /></ProtectedRoute>
    },
    {
      path: '/dashboard/payments',
      element: <ProtectedRoute allowedRoles={['landlord']}><PaymentsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/leases',
      element: <ProtectedRoute allowedRoles={['landlord']}><LeasesPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/requests',
      element: <ProtectedRoute allowedRoles={['landlord']}><RequestsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/meetings',
      element: <ProtectedRoute allowedRoles={['landlord']}><MeetingsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/notices',
      element: <ProtectedRoute allowedRoles={['landlord']}><NoticesPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/register-tenant',
      element: <ProtectedRoute allowedRoles={['landlord']}><RegisterTenantPage /></ProtectedRoute>
    },

    // Tenant Only Routes (Main Portal)
    {
      path: '/dashboard/my-property',
      element: <ProtectedRoute allowedRoles={['tenant']}><MyPropertyPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/tenant-payments',
      element: <ProtectedRoute allowedRoles={['tenant']}><TenantPaymentsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/maintenance',
      element: <ProtectedRoute allowedRoles={['tenant']}><TenantMaintenancePage /></ProtectedRoute>
    },
    {
      path: '/dashboard/my-requests',
      element: <ProtectedRoute allowedRoles={['tenant']}><TenantRentalRequestsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/my-notices',
      element: <ProtectedRoute allowedRoles={['tenant']}><TenantNoticesPage /></ProtectedRoute>
    },

    // Admin Only Routes
    {
      path: '/dashboard/admin/users',
      element: <ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/admin/create-landlord',
      element: <ProtectedRoute allowedRoles={['admin']}><AdminCreateLandlordPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/admin/leases',
      element: <ProtectedRoute allowedRoles={['admin']}><AdminLeasesPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/admin/payments',
      element: <ProtectedRoute allowedRoles={['admin']}><AdminPaymentsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/admin/maintenance',
      element: <ProtectedRoute allowedRoles={['admin']}><AdminMaintenancePage /></ProtectedRoute>
    },
    {
      path: '/dashboard/admin/notices',
      element: <ProtectedRoute allowedRoles={['admin']}><AdminNoticesPage /></ProtectedRoute>
    },

    { path: '*', element: <NotFound /> },
  ])

  return routes
}
