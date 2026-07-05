import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import RegisterDonor from './pages/public/RegisterDonor';
import RegisterOrg from './pages/public/RegisterOrg';
import Campaigns from './pages/public/Campaigns';
import CampaignDetail from './pages/public/CampaignDetail';
import Emergency from './pages/public/Emergency';
import EmergencyDetail from './pages/public/EmergencyDetail';
import Organizations from './pages/public/Organizations';
import Leaderboard from './pages/public/Leaderboard';
import HowItWorks from './pages/public/HowItWorks';

import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorDonations from './pages/donor/Donations';
import DonorBadges from './pages/donor/Badges';
import DonorNotifications from './pages/donor/Notifications';

import OrgDashboard from './pages/organization/Dashboard';
import OrgProfile from './pages/organization/Profile';
import OrgCampaigns from './pages/organization/Campaigns';
import CreateCampaign from './pages/organization/CreateCampaign';
import OrgEmergency from './pages/organization/Emergency';
import CreateEmergency from './pages/organization/CreateEmergency';
import OrgInventory from './pages/organization/Inventory';

import AdminDashboard from './pages/admin/Dashboard';
import AdminOrganizations from './pages/admin/Organizations';
import AdminDonors from './pages/admin/Donors';
import AdminCampaigns from './pages/admin/Campaigns';
import AdminEmergency from './pages/admin/Emergency';
import AdminBroadcast from './pages/admin/Broadcast';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingScreen from './components/common/LoadingScreen';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    if (user.role === 'organization') return <Navigate to="/organization/dashboard" />;
    return <Navigate to="/donor/dashboard" />;
  }
  return children;
};

function AppContent() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register/donor" element={<PublicOnlyRoute><RegisterDonor /></PublicOnlyRoute>} />
          <Route path="/register/organization" element={<PublicOnlyRoute><RegisterOrg /></PublicOnlyRoute>} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/emergency/:id" element={<EmergencyDetail />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* Donor */}
          <Route path="/donor/dashboard" element={<ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>} />
          <Route path="/donor/profile" element={<ProtectedRoute role="donor"><DonorProfile /></ProtectedRoute>} />
          <Route path="/donor/donations" element={<ProtectedRoute role="donor"><DonorDonations /></ProtectedRoute>} />
          <Route path="/donor/badges" element={<ProtectedRoute role="donor"><DonorBadges /></ProtectedRoute>} />
          <Route path="/donor/notifications" element={<ProtectedRoute role="donor"><DonorNotifications /></ProtectedRoute>} />

          {/* Organization */}
          <Route path="/organization/dashboard" element={<ProtectedRoute role="organization"><OrgDashboard /></ProtectedRoute>} />
          <Route path="/organization/profile" element={<ProtectedRoute role="organization"><OrgProfile /></ProtectedRoute>} />
          <Route path="/organization/campaigns" element={<ProtectedRoute role="organization"><OrgCampaigns /></ProtectedRoute>} />
          <Route path="/organization/campaigns/create" element={<ProtectedRoute role="organization"><CreateCampaign /></ProtectedRoute>} />
          <Route path="/organization/emergency" element={<ProtectedRoute role="organization"><OrgEmergency /></ProtectedRoute>} />
          <Route path="/organization/emergency/create" element={<ProtectedRoute role="organization"><CreateEmergency /></ProtectedRoute>} />
          <Route path="/organization/inventory" element={<ProtectedRoute role="organization"><OrgInventory /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/organizations" element={<ProtectedRoute role="admin"><AdminOrganizations /></ProtectedRoute>} />
          <Route path="/admin/donors" element={<ProtectedRoute role="admin"><AdminDonors /></ProtectedRoute>} />
          <Route path="/admin/campaigns" element={<ProtectedRoute role="admin"><AdminCampaigns /></ProtectedRoute>} />
          <Route path="/admin/emergency" element={<ProtectedRoute role="admin"><AdminEmergency /></ProtectedRoute>} />
          <Route path="/admin/broadcast" element={<ProtectedRoute role="admin"><AdminBroadcast /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
