import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calculator, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
 
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setLoading(true);
    setError(null);

    let mockUser = {
      UserID: 1,
      Name: "Taxpayer Demo",
      Email: email,
      Role: "Taxpayer",
      PhoneNumber: "0771122334",
      Status: "Active"
    };

    if (email.toLowerCase().includes('admin')) {
      mockUser = {
        UserID: 2,
        Name: "Admin Demo",
        Email: email,
        Role: "System Administrator",
        PhoneNumber: "0779988776",
        Status: "Active"
      };
    } 
    else if (email.toLowerCase().includes('accountant') || email.toLowerCase().includes('acc')) {
      mockUser = {
        UserID: 3,
        Name: "Accountant Demo",
        Email: email,
        Role: "Accountant",
        PhoneNumber: "0775566778",
        Status: "Active"
      };
    }

    setTimeout(() => {
      login("mock_token_12345", mockUser);
      setLoading(false);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white p-8 border border-border shadow-sm rounded-xl flex flex-col gap-6">
        
        {/* Logo Placeholder (Rectangle with Calculator) */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
            <Calculator className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* Login Header */}
        <div className="text-center">
          <h1 className="font-heading font-bold text-2xl uppercase tracking-tight text-secondary text-slate-900">Login</h1>
          <div className="h-[3px] w-8 bg-primary mx-auto mt-2"></div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 text-danger border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="h-11 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="h-11 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
              required
            />
          </div>

          {/* Action Row */}
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={() => alert('Demo reset credentials: Password is password123 for default accounts.')} 
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all text-sm tracking-widest uppercase mt-2 flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Login'
            )}
          </button>

          {/* Register Redirect */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline border-b border-primary/30">
                Register
              </Link>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
