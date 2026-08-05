import { useContext } from "react";
import { useRoutes } from "react-router-dom";
import { AuthContext } from "./AuthContext";
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
import AdminRentalRequestsPage from './pages/admin/AdminRentalRequestsPage'

// House-Hunting Pages
import ListingsPage from "./pages/househunting/ListingsPage";
import PropertyDetailPage from "./pages/househunting/PropertyDetailPage";
import TenantDashboardPage from "./pages/househunting/TenantDashboardPage";
import MyRequestsPage from "./pages/househunting/MyRequestsPage";
import RegisterPage from "./pages/househunting/RegisterPage";
import TrackRequestPage from "./pages/househunting/TrackRequestPage";

// Profile Page (all roles)
import ProfilePage from "./pages/ProfilePage";

// Role-aware wrapper for shared routes (payments/maintenance)
// Renders the tenant or landlord page depending on the logged-in user's role.
function RoleSwitch({ role }) {
  const { user } = useContext(AuthContext)
  const isTenant = user?.role === 'tenant'
  if (role === 'payments') return isTenant ? <TenantPaymentsPage /> : <PaymentsPage />
  if (role === 'maintenance') return isTenant ? <TenantMaintenancePage /> : <LandlordMaintenancePage />
  return null
}

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
    { path: '/houses/track-request', element: <TrackRequestPage /> },
    { path: '/houses/:id', element: <PropertyDetailPage /> },

// Protected routes — tenant must be logged in.
    // allowUnregisteredTenant: self-registered tenants (browsing/applying via
    // house-hunting) are allowed here even before a landlord links them to a house.
    {
      path: '/houses/dashboard',
      element: <ProtectedRoute allowedRoles={['tenant']} allowUnregisteredTenant><TenantDashboardPage /></ProtectedRoute>
    },
    {
      path: '/houses/my-requests',
      element: <ProtectedRoute allowedRoles={['tenant']} allowUnregisteredTenant><MyRequestsPage /></ProtectedRoute>
    },

    // =====================
    // LANDLORD / ADMIN PORTAL (Private)
    // =====================

// Shared Dashboard — all roles (landlord / admin / tenant)
    // All dashboard sub-routes are NESTED so they share the Dashboard layout
    // (sidebar, header, horizontal top nav bar) via <Outlet />.
{
      path: '/dashboard',
      element: (
        <ProtectedRoute allowedRoles={['landlord', 'admin', 'tenant']} allowUnregisteredTenant>
          <DashboardPage />
        </ProtectedRoute>
      ),
      children: [
        // Landlord Only Routes
        { path: 'properties', element: <ProtectedRoute allowedRoles={['landlord']}><PropertiesPage /></ProtectedRoute> },
        { path: 'tenants', element: <ProtectedRoute allowedRoles={['landlord']}><TenantsPage /></ProtectedRoute> },
        { path: 'leases', element: <ProtectedRoute allowedRoles={['landlord']}><LeasesPage /></ProtectedRoute> },
        { path: 'requests', element: <ProtectedRoute allowedRoles={['landlord']}><RequestsPage /></ProtectedRoute> },
        { path: 'meetings', element: <ProtectedRoute allowedRoles={['landlord']}><MeetingsPage /></ProtectedRoute> },
        { path: 'notices', element: <ProtectedRoute allowedRoles={['landlord']}><NoticesPage /></ProtectedRoute> },
        { path: 'register-tenant', element: <ProtectedRoute allowedRoles={['landlord']}><RegisterTenantPage /></ProtectedRoute> },
        { path: 'payments', element: <ProtectedRoute allowedRoles={['landlord', 'tenant']}><RoleSwitch role="payments" /></ProtectedRoute> },
        { path: 'maintenance', element: <ProtectedRoute allowedRoles={['landlord', 'tenant']}><RoleSwitch role="maintenance" /></ProtectedRoute> },
        // Shared Profile Page — all roles (landlord / admin / tenant)
        { path: 'profile', element: <ProtectedRoute allowedRoles={['landlord', 'admin', 'tenant']} allowUnregisteredTenant><ProfilePage /></ProtectedRoute> },

        // Tenant Only Routes (Main Portal)
        { path: 'my-property', element: <ProtectedRoute allowedRoles={['tenant']}><MyPropertyPage /></ProtectedRoute> },
        { path: 'tenant-payments', element: <ProtectedRoute allowedRoles={['tenant']}><TenantPaymentsPage /></ProtectedRoute> },
        { path: 'my-requests', element: <ProtectedRoute allowedRoles={['tenant']}><TenantRentalRequestsPage /></ProtectedRoute> },
        { path: 'my-notices', element: <ProtectedRoute allowedRoles={['tenant']}><TenantNoticesPage /></ProtectedRoute> },

        // Admin Only Routes
        { path: 'admin/users', element: <ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute> },
        { path: 'admin/create-landlord', element: <ProtectedRoute allowedRoles={['admin']}><AdminCreateLandlordPage /></ProtectedRoute> },
        { path: 'admin/leases', element: <ProtectedRoute allowedRoles={['admin']}><AdminLeasesPage /></ProtectedRoute> },
        { path: 'admin/payments', element: <ProtectedRoute allowedRoles={['admin']}><AdminPaymentsPage /></ProtectedRoute> },
        { path: 'admin/maintenance', element: <ProtectedRoute allowedRoles={['admin']}><AdminMaintenancePage /></ProtectedRoute> },
        { path: 'admin/notices', element: <ProtectedRoute allowedRoles={['admin']}><AdminNoticesPage /></ProtectedRoute> },
        { path: 'admin/rental-requests', element: <ProtectedRoute allowedRoles={['admin']}><AdminRentalRequestsPage /></ProtectedRoute> },
      ]
    },

    { path: '*', element: <NotFound /> },
  ])

  return routes
}
