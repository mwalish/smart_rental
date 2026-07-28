import { useRoutes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";

// Landlord Pages
import PropertiesPage from "./pages/landlord/PropertiesPage";
import TenantsPage from "./pages/landlord/TenantsPage";
import PaymentsPage from "./pages/landlord/PaymentsPage";
import LeasesPage from "./pages/landlord/LeasesPage";
import RequestsPage from "./pages/landlord/RequestsPage";
import MeetingsPage from "./pages/landlord/MeetingsPage";

// Tenant Pages
import MyPropertyPage from "./pages/tenant/MyPropertyPage";
import TenantPaymentsPage from "./pages/tenant/TenantPaymentsPage";
import MaintenancePage from "./pages/tenant/MaintenancePage";

export default function App() {
  const routes = useRoutes([
    { path: '/', element: <LandingPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/not-authorized', element: <NotAuthorized /> },

    // Shared Dashboard
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute allowedRoles={['landlord', 'tenant', 'admin']}>
          <DashboardPage />
        </ProtectedRoute>
      )
    },

    // Landlord Only Routes — EXACTLY matches your Django urls.py
    {
      path: '/dashboard/properties',
      element: <ProtectedRoute allowedRoles={['landlord']}><PropertiesPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/tenants',
      element: <ProtectedRoute allowedRoles={['landlord']}><TenantsPage /></ProtectedRoute>
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
      path: '/dashboard/maintenance',
      element: <ProtectedRoute allowedRoles={['landlord']}><RequestsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/meetings',
      element: <ProtectedRoute allowedRoles={['landlord']}><MeetingsPage /></ProtectedRoute>
    },

    // Tenant Only Routes
    {
      path: '/dashboard/my-property',
      element: <ProtectedRoute allowedRoles={['tenant']}><MyPropertyPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/payments',
      element: <ProtectedRoute allowedRoles={['tenant']}><TenantPaymentsPage /></ProtectedRoute>
    },
    {
      path: '/dashboard/maintenance',
      element: <ProtectedRoute allowedRoles={['tenant']}><MaintenancePage /></ProtectedRoute>
    },

    { path: '*', element: <NotFound /> },
  ])

  return routes
}
// import { useRoutes } from "react-router-dom";

// import LandingPage from "./pages/LandingPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import NotFound from "./pages/NotFound";
// import NotAuthorized from "./pages/NotAuthorized";
// import ProtectedRoute from "./ProtectedRoute";
// import DashboardPage from "./pages/DashboardPage";

// export default function App() {
//   const routes = useRoutes([
//     { path: '/', element: <LandingPage /> },
//     { path: '/login', element: <LoginPage /> },
//     { path: '/register', element: <RegisterPage /> },
//     { path: '/not-authorized', element: <NotAuthorized /> },
//     { 
//       path: '/dashboard', 
//       element: (
//         <ProtectedRoute allowedRoles={['landlord', 'tenant', 'admin']}>
//           <DashboardPage />
//         </ProtectedRoute>
//       )
//     },
//     { path: '*', element: <NotFound /> },
//   ])

//   return routes
// }
