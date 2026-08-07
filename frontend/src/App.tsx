import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Income } from './pages/Income';
import { AddIncome } from './pages/AddIncome';
import { Expenses } from './pages/Expenses';
import { AddExpense } from './pages/AddExpense';
import { AutomationHub } from './pages/AutomationHub';
import { TaxReturn } from './pages/TaxReturn';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { AccountantDashboard } from './pages/AccountantDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Protected Workspace Pages */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/income/add" element={<AddIncome />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/automation" element={<AutomationHub />} />
            <Route path="/tax/return" element={<TaxReturn />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />

            {/* Accountant Portal */}
            <Route path="/accountant/dashboard" element={<AccountantDashboard />} />

            {/* Admin Portal */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Absolute Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
