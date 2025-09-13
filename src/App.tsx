// App.tsx (Final, Corrected Routing)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import useAuth here
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Import all your pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardAdminPage } from './pages/admin/DashboardAdminPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { CompliancePage } from './pages/admin/CompliancePage';
import { FinancialManagementPage } from './pages/admin/FinancialManagementPage';
import { ModulesMarketplacePage } from './pages/admin/ModulesMarketplacePage';
import { DashboardTeacherPage } from './pages/teacher/DashboardTeacherPage';
import { CurriculumPlannerPage } from './pages/teacher/CurriculumPlannerPage';
import { DashboardParentPage } from './pages/parent/DashboardParentPage';
import { StudentProfilePage } from './pages/shared/StudentProfilePage';
import { CalendarPage } from './pages/shared/CalendarPage';
import { EnrollStudentPage } from './pages/admin/EnrollStudentPage';
import { EnrollmentSuccessPage } from './pages/admin/EnrollmentSuccessPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            {/* First, we protect the entire dashboard area. */}
            <Route element={<ProtectedRoute />}>
              {/* If protected, we then render the main layout. */}
              <Route element={<DashboardLayout />}>
                {/* All routes nested here will render inside the DashboardLayout's <Outlet /> */}
                
                {/* The root path now correctly redirects based on role */}
                <Route path="/" element={<DashboardRedirect />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />
                
                {/* --- Admin Routes --- */}
                {/* Role-specific protection can be handled inside the components or a role-specific layout if needed */}
                <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
                <Route path="/admin/students" element={<StudentsPage />} />
                <Route path="/admin/teachers" element={<TeachersPage />} />
                <Route path="/admin/compliance" element={<CompliancePage />} />
                <Route path="/admin/financials" element={<FinancialManagementPage />} />
                <Route path="/admin/modules" element={<ModulesMarketplacePage />} />
                <Route path="/admin/students/enroll" element={<EnrollStudentPage />} />
                <Route path="/admin/students/enroll/success" element={<EnrollmentSuccessPage />} />
                
                {/* --- Teacher Routes --- */}
                <Route path="/teacher/dashboard" element={<DashboardTeacherPage />} />
                <Route path="/teacher/planner" element={<CurriculumPlannerPage />} />
                
                {/* --- Parent Routes --- */}
                <Route path="/parent/dashboard" element={<DashboardParentPage />} />
                
                {/* --- Shared Routes --- */}
                <Route path="/student/:studentId" element={<StudentProfilePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                
                {/* Placeholder pages */}
                <Route path="/admin/co-pilot" element={<PlaceholderPage title="AI Co-Pilot" />} />
                <Route path="/parent/connection" element={<PlaceholderPage title="Connection Hub" />} />
                <Route path="/settings" element={<PlaceholderPage title="Settings" />} />

              </Route>
            </Route>
            
            {/* Catch all for any unknown routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

// Component to redirect to the appropriate dashboard based on user role
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  
  // This check is slightly redundant because of ProtectedRoute, but it's safe.
  if (!user) return <Navigate to="/login" replace />;
  
  const dashboardPath = user.role === 'admin' ? '/admin/dashboard'
                       : user.role === 'teacher' ? '/teacher/dashboard'
                       : '/parent/dashboard';
  
  return <Navigate to={dashboardPath} replace />;
};

// Placeholder component for pages that haven't been implemented yet
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600">This page is coming soon! 🚧</p>
  </div>
);

export default App;