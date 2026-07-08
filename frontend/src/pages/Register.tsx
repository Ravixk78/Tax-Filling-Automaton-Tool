import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calculator, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Inputs state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('Individual Taxpayer');
  const [licenseNumber, setLicenseNumber] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (role === 'Accountant' && !licenseNumber) {
      setError('License number is required for accountants.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        Name: name,
        Email: email,
        PhoneNumber: phone,
        Password: password,
        Role: role,
        LicenseNumber: role === 'Accountant' ? licenseNumber : undefined
      });

      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-[450px] bg-white p-8 border border-border shadow-sm rounded-xl flex flex-col gap-5">
        
        {/* Logo Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-heading font-bold text-2xl uppercase tracking-tight text-secondary text-slate-900">Register</h1>
          <div className="h-[3px] w-8 bg-primary mx-auto mt-2"></div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 text-danger border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
              required
            >
              <option value="Individual Taxpayer">Individual Taxpayer</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Small Business Owner">Small Business Owner</option>
              <option value="Accountant">Accountant / Professional</option>
            </select>
          </div>

          {/* License Number (Accountant only) */}
          {role === 'Accountant' && (
            <div className="flex flex-col gap-1 animate-fadeIn">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Professional License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. LIC-2026-XXXXX"
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all text-xs tracking-widest uppercase mt-3 flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Register Account'
            )}
          </button>

          {/* Login Redirect */}
          <div className="text-center pt-1.5">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline border-b border-primary/30">
                Login
              </Link>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
