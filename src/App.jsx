// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Library from './pages/Library';
import BookDetails from './pages/BookDetails';
import Categories from './pages/Categories';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import Dashboard from './pages/Dashboard';
import MySubscription from './pages/MySubscription';
import ReadingHistory from './pages/ReadingHistory';
import Profile from './pages/Profile';
import Reader from './pages/Reader';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminBooks from './pages/admin/AdminBooks';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBookAccess from './pages/admin/AdminBookAccess';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSubscriptionPlans from './pages/admin/AdminSubscriptionPlans';
import AdminLayout from './pages/admin/AdminLayout';

export default function App() {
  return (
    <Routes>
      {/* The reader is a full-bleed, chrome-free experience — it renders its
          own dark topbar and skips the normal site Navbar/Footer entirely.
          No auth requirement of its own: anonymous visitors may enter to
          read the free preview (see access.service.js on the backend);
          the Reader page calls /access itself and adapts. */}
      <Route path="/read/:id" element={<Reader />} />

      <Route
        path="/*"
        element={
          <>
            <Navbar />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Library />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/subscription" element={<SubscriptionPlans />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/my-subscription" element={<ProtectedRoute><MySubscription /></ProtectedRoute>} />
                <Route path="/reading-history" element={<ProtectedRoute><ReadingHistory /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/:id" element={<AdminUserDetail />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="book-access" element={<AdminBookAccess />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="subscription-plans" element={<AdminSubscriptionPlans />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </>
        }
      />
    </Routes>
  );
}
