import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState<string>(user?.Name || '');
  const [phone, setPhone] = useState<string>(user?.PhoneNumber || '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { Name: name, PhoneNumber: phone };
      if (password) payload.Password = password;

      await api.put('/auth/profile', payload);
      setSuccess('Profile configuration successfully updated!');
      setPassword('');
      setConfirmPassword('');
      refreshProfile();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Are you sure you want to delete your account permanently? This action is irreversible.')) {
      alert('Delete account mock: Your account has been flagged for deletion.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-3xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Settings</h1>
        <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-50 text-success border border-green-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-danger border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <span>Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address (Locked)</span>
              <span className="text-sm font-semibold text-slate-700 bg-slate-50 border border-border rounded-lg px-4 py-2 font-mono">
                {user?.Email}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role (Locked)</span>
              <span className="text-sm font-semibold text-slate-700 bg-slate-50 border border-border rounded-lg px-4 py-2 capitalize">
                {user?.Role}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Card */}
        <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span>Security & Access</span>
          </h3>
          <p className="text-xs text-slate-400">Leave password fields blank if you do not wish to modify your account credentials.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all text-xs tracking-widest uppercase shadow-sm"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/50 border border-red-200 p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-red-700 leading-relaxed">
          Deleting your profile deletes all financial statements, receipts uploads, and calculated tax returns from compliance memory. This cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded-lg hover:bg-red-50 text-xs font-bold transition-all uppercase"
        >
          Delete Account Permanently
        </button>
      </div>

    </div>
  );
};
