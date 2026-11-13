import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { PricingPage } from '../pages/public/PricingPage';
import { PublicJobsPage } from '../pages/public/PublicJobsPage';
import { PublicJobDetailPage } from '../pages/public/PublicJobDetailPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Recruiter Pages
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard';
import { JobsManagementPage } from '../pages/recruiter/JobsManagementPage';
import { CreateJobPage } from '../pages/recruiter/CreateJobPage';
import { ApplicationsPage } from '../pages/recruiter/ApplicationsPage';
import { KanbanPage } from '../pages/recruiter/KanbanPage';
import { CandidatesDirectoryPage } from '../pages/recruiter/CandidatesDirectoryPage';
import { CandidateDetailPage } from '../pages/recruiter/CandidateDetailPage';
import { InterviewCalendarPage } from '../pages/recruiter/InterviewCalendarPage';
import { AnalyticsPage } from '../pages/recruiter/AnalyticsPage';
import { TeamManagementPage } from '../pages/recruiter/TeamManagementPage';
import { CompanySettingsPage } from '../pages/recruiter/CompanySettingsPage';

// Candidate Pages
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard';
import { MyApplicationsPage } from '../pages/candidate/MyApplicationsPage';
import { CandidateProfilePage } from '../pages/candidate/CandidateProfilePage';
import { CandidateInterviewsPage } from '../pages/candidate/CandidateInterviewsPage';

// Admin Pages
import { SuperAdminDashboard } from '../pages/admin/SuperAdminDashboard';
import { AdminOrganizationsPage } from '../pages/admin/AdminOrganizationsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminJobsPage } from '../pages/admin/AdminJobsPage';
import { AdminActivityLogsPage } from '../pages/admin/AdminActivityLogsPage';
import { AdminSystemHealthPage } from '../pages/admin/AdminSystemHealthPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/jobs" element={<PublicJobsPage />} />
        <Route path="/jobs/:slug" element={<PublicJobDetailPage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Recruiter Workspace */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['RECRUITER', 'HIRING_MANAGER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="jobs" element={<JobsManagementPage />} />
        <Route path="jobs/create" element={<CreateJobPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="kanban" element={<KanbanPage />} />
        <Route path="candidates" element={<CandidatesDirectoryPage />} />
        <Route path="candidates/:id" element={<CandidateDetailPage />} />
        <Route path="interviews" element={<InterviewCalendarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="team" element={<TeamManagementPage />} />
        <Route path="settings" element={<CompanySettingsPage />} />
        <Route path="profile" element={<CompanySettingsPage />} />
      </Route>

      {/* Candidate Portal */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="jobs" element={<PublicJobsPage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="interviews" element={<CandidateInterviewsPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="settings" element={<CandidateProfilePage />} />
      </Route>

      {/* Super Admin Control Center */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="organizations" element={<AdminOrganizationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="logs" element={<AdminActivityLogsPage />} />
        <Route path="health" element={<AdminSystemHealthPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

