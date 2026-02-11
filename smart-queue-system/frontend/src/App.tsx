import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Student Routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute roles={['student', 'staff', 'admin']}>
              <StudentDashboard />
            </PrivateRoute>
          } 
        />

        {/* Staff Routes */}
        <Route 
          path="/staff" 
          element={
            <PrivateRoute roles={['staff', 'admin']}>
              <StaffDashboard />
            </PrivateRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
