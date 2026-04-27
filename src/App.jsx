import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tienda from './pages/Tienda';
import DetalleProducto from './pages/DetalleProducto';
import Nosotros from './pages/Nosotros';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminVariants from './pages/admin/Variants';
import AdminCategories from './pages/admin/Categories';
import AdminMarcas from './pages/admin/Marcas';
import AdminCondiciones from './pages/admin/Condiciones';
import AdminOrders from './pages/admin/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con Navbar + Footer */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tienda" element={<Tienda />} />
          <Route path="producto/:id" element={<DetalleProducto />} />
          <Route path="nosotros" element={<Nosotros />} />
        </Route>

        {/* Auth */}
        <Route path="login" element={<Login />} />

        {/* Admin */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="variants" element={<AdminVariants />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="marcas" element={<AdminMarcas />} />
          <Route path="condiciones" element={<AdminCondiciones />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
