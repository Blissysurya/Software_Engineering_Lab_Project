import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import StudentHome from './pages/student/Home';
import ShopDetail from './pages/student/ShopDetail';
import CartPage from './pages/student/Cart';
import Checkout from './pages/student/Checkout';
import MyOrders from './pages/student/MyOrders';

import VendorDashboard from './pages/vendor/Dashboard';
import VendorMenu from './pages/vendor/Menu';
import IncomingOrders from './pages/vendor/IncomingOrders';
import OrderQueue from './pages/vendor/OrderQueue';

import DeliveryDashboard from './pages/delivery/Dashboard';

import AdminDashboard from './pages/admin/Dashboard';
import AdminShops from './pages/admin/Shops';
import AdminUsers from './pages/admin/Users';

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'vendor') return <Navigate to="/vendor" replace />;
  if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/shops" replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<RoleHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/shops" element={<ProtectedRoute roles={['student']}><StudentHome /></ProtectedRoute>} />
        <Route path="/shops/:id" element={<ProtectedRoute roles={['student']}><ShopDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute roles={['student']}><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute roles={['student']}><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['student']}><MyOrders /></ProtectedRoute>} />

        <Route path="/vendor" element={<ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/menu" element={<ProtectedRoute roles={['vendor']}><VendorMenu /></ProtectedRoute>} />
        <Route path="/vendor/incoming" element={<ProtectedRoute roles={['vendor']}><IncomingOrders /></ProtectedRoute>} />
        <Route path="/vendor/queue" element={<ProtectedRoute roles={['vendor']}><OrderQueue /></ProtectedRoute>} />

        <Route path="/delivery" element={<ProtectedRoute roles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/shops" element={<ProtectedRoute roles={['admin']}><AdminShops /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />

        <Route path="/unauthorized" element={
          <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
            403 — Access Forbidden
          </div>
        } />
        <Route path="*" element={
          <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
            404 — Page Not Found
          </div>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
