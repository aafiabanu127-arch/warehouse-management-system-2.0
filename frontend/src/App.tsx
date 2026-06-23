import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Warehouses from './pages/Warehouses';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import Analytics from './pages/Analytics';
import Approvals from './pages/Approvals';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import Zones from './pages/Zones';
import Racks from './pages/Racks';
import Shelves from './pages/Shelves';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/notifications"   element={<Notifications />} />
            <Route path="/inventory"       element={<Inventory />} />
            <Route path="/stock-movements" element={<StockMovements />} />
            <Route path="/products"        element={<Products />} />
            <Route path="/categories"      element={<Categories />} />
            <Route path="/warehouses"      element={<Warehouses />} />
            <Route path="/zones"           element={<Zones />} />
            <Route path="/racks"           element={<Racks />} />
            <Route path="/shelves"         element={<Shelves />} />
          </Route>

          <Route element={<ProtectedRoute minLevel={1}><Layout /></ProtectedRoute>}>
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute minLevel={2}><Layout /></ProtectedRoute>}>
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          <Route element={<ProtectedRoute minLevel={3}><Layout /></ProtectedRoute>}>
            <Route path="/approvals" element={<Approvals />} />
          </Route>

          <Route element={<ProtectedRoute minLevel={5}><Layout /></ProtectedRoute>}>
            <Route path="/users" element={<UserManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
