import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Loader from './components/Loader.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import SiteLayout from './components/SiteLayout.jsx'
import PortalLayout from './components/PortalLayout.jsx'
import AuthLayout from './components/AuthLayout.jsx'

// Route-based code splitting: each page is its own Vite chunk
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Explore = lazy(() => import('./pages/Explore.jsx'))
const CarDetails = lazy(() => import('./pages/CarDetails.jsx'))
const Advisor = lazy(() => import('./pages/Advisor.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const Tasks = lazy(() => import('./pages/Tasks.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const DealerDashboard = lazy(() => import('./pages/DealerDashboard.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))

export default function App() {
  return (
    <Suspense fallback={<Loader label="Loading page chunk…" big />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AuthLayout />}><Route path="/login" element={<Login />} /></Route>
        {/* Customer website */}
        <Route element={<SiteLayout />}>
          <Route path="/explore" element={<Explore />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/advisor" element={<Advisor />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/tasks" element={<ProtectedRoute roles={['customer']}><Tasks /></ProtectedRoute>} />
        </Route>
        {/* Dealer-only and admin-only areas */}
        <Route element={<ProtectedRoute roles={['dealer']}><PortalLayout /></ProtectedRoute>}><Route path="/dealer" element={<DealerDashboard />} /><Route path="/dealer/tasks" element={<Tasks />} /></Route>
        <Route element={<ProtectedRoute roles={['admin']}><PortalLayout /></ProtectedRoute>}><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/tasks" element={<Tasks />} /></Route>
        <Route path="*" element={<p className="empty">Page not found.</p>} />
      </Routes>
    </Suspense>
  )
}
