import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';
import MemberProfile from './pages/MemberProfile';
import WorkingReport from './pages/WorkingReport';
import AnnualLeave from './pages/AnnualLeave';
import Notifications from './pages/Notifications';
import LeaveManagement from './pages/LeaveManagement';
import MemberLayout from './components/MemberLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminAttendanceList from './pages/admin/AdminAttendanceList';
import UserManagement from './pages/admin/UserManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import AdminWorkingReports from './pages/admin/AdminWorkingReports';
import ProjectDetail from './pages/ProjectDetail';
import SystemMaster from './pages/admin/SystemMaster';
import AvailableMember from './pages/admin/AvailableMember';
import ProjectResource from './pages/admin/ProjectResource';
import ProtectedRoute from './components/ProtectedRoute';
import AttendanceRequest from './pages/AttendanceRequest';
import AttendanceRequestManagement from './pages/admin/AttendanceRequestManagement';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Router>
              <div className="min-h-screen bg-surface-50 text-surface-950 dark:bg-surface-950 dark:text-white font-sans transition-colors duration-200">
                <Routes>
                <Route path="/login" element={<Login />} />

                {/* Member Routes — nested inside MemberLayout */}
                <Route path="/member" element={
                  <ProtectedRoute allowedRoles={['MEMBER', 'ADMIN']}>
                    <MemberLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<MemberDashboard />} />
                  <Route path="profile" element={<MemberProfile />} />
                  <Route path="working-report" element={<WorkingReport />} />
                  <Route path="annual-leave" element={<AnnualLeave />} />
                  <Route path="attendance-requests" element={<AttendanceRequest />} />
                  <Route path="leave-approval" element={<LeaveManagement />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                </Route>

                {/* Admin Routes — nested inside AdminLayout */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboardHome />} />
                  <Route path="attendance" element={<AdminAttendanceList />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="projects" element={<ProjectManagement />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="working-reports" element={<AdminWorkingReports />} />
                  <Route path="attendance-requests" element={<AttendanceRequestManagement />} />
                  <Route path="leaves" element={<LeaveManagement />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="system" element={<SystemMaster />} />
                  <Route path="available-members" element={<AvailableMember />} />
                  <Route path="project-resources" element={<ProjectResource />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
            </Router>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
