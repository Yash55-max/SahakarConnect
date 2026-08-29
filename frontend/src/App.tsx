import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { DemoBar } from './components/layout/DemoBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ConsumerHome } from './pages/consumer/ConsumerHome';
import { ConsumerBookings } from './pages/consumer/ConsumerBookings';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RegulatorDashboard } from './pages/regulator/RegulatorDashboard';
import { GovernancePage } from './pages/governance/GovernancePage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Top Hackathon Demo Switcher */}
            <DemoBar />

            {/* Navigation Header */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <Routes>
                <Route path="/" element={<ConsumerHome />} />
                <Route path="/services" element={<ConsumerHome />} />
                <Route path="/bookings" element={<ConsumerBookings />} />
                <Route path="/provider" element={<ProviderDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/regulator" element={<RegulatorDashboard />} />
                <Route path="/governance" element={<GovernancePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
