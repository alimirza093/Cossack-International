import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/routing/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AdminRoute from './components/auth/AdminRoute';
import CustomerRoute from './components/auth/CustomerRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductCreatePage from './pages/admin/AdminProductCreatePage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import Checkout from './pages/Checkout';
import { WhatsAppFloatingButton } from './components/ui/WhatsAppFloatingButton';

const App: React.FC = () => (
  <BrowserRouter>
    <ScrollToTop />
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Products />} />
          <Route path="/products" element={<Navigate to="/shop" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/collections" element={<Navigate to="/products" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <CustomerRoute>
                <Cart />
              </CustomerRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <AdminRoute>
                <AdminProductCreatePage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <AdminRoute>
                <AdminProductEditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategoriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <AdminRoute>
                <AdminOrderDetailPage />
              </AdminRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <CustomerRoute>
                <Orders />
              </CustomerRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <CustomerRoute>
                <OrderDetails />
              </CustomerRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <CustomerRoute>
                <OrderSuccess />
              </CustomerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <WhatsAppFloatingButton />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
