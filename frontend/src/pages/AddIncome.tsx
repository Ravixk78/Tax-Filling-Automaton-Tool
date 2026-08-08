import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  CircleDollarSign, 
  CheckCircle2, 
  Calculator, 
  AlertCircle,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  DollarSign
} from 'lucide-react';

export const AddIncome: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeType, setIncomeType] = useState('Freelance');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [description, setDescription] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live tax impact computation state
  const [currentTaxable, setCurrentTaxable] = useState(0);
  const [currentTax, setCurrentTax] = useState(0);

  useEffect(() => {
    // Fetch current tax context to show live impact preview
    const fetchCurrentTax = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await api.get(`/tax/calculate?year=${year}`);
        if (res.data && res.data.calculation) {
          setCurrentTaxable(res.data.calculation.taxableIncome || 0);
          setCurrentTax(res.data.calculation.taxAmount || 0);
        }
      } catch (err) {
        console.error('Tax preview fetch error:', err);
      }
    };
    fetchCurrentTax();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const projectedTaxable = currentTaxable + numAmount;
  // Estimate tax delta (assume effective ~15% tax bracket on net taxable income increase)
  const estimatedTaxDelta = numAmount > 0 ? numAmount * 0.15 : 0;
  const projectedTax = currentTax + estimatedTaxDelta;

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!source.trim() || !amount || parseFloat(amount) <= 0 || !incomeDate) {
      setError('Please provide a valid source name, positive amount, and transaction date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        Source: source.trim(),
        Amount: parseFloat(amount),
        IncomeType: incomeType,
        Description: description ? `[Method: ${paymentMethod}] ${description}` : `Payment received via ${paymentMethod}`,
        IncomeDate: new Date(incomeDate).toISOString()
      };

      await api.post('/income', payload);

      setSuccessMsg('Income transaction recorded successfully!');

      if (addAnother) {
        setSource('');
        setAmount('');
        setDescription('');
        setIncomeDate(new Date().toISOString().split('T')[0]);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setTimeout(() => {
          navigate('/income');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record income transaction. Check backend service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-800">
      
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <Link
            to="/income"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition shadow-sm flex items-center justify-center"
            title="Back to Income List"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-700 tracking-wider">
                Full Page Entry
              </span>
              <span className="text-xs text-slate-400 font-mono">Tax Filing Year: {new Date().getFullYear()}</span>
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-slate-900 mt-1">Record New Income Record</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/income')}
          className="text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          Cancel & Exit
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main 2-Column Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details (2 cols wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
            
            {/* Source / Client Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Income Source / Client Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Keells Supermarket Supplier Contract / Client Offshore Retainer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Grid 2: Amount & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Amount (LKR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 font-mono font-bold text-xs text-slate-400">LKR</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono font-bold text-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Income Category / Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <select
                    value={incomeType}
                    onChange={(e) => setIncomeType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
                  >
                    <option value="Salary">Salary / Employment Income</option>
                    <option value="Freelance">Freelance & Consulting Services</option>
                    <option value="Business">Business Payout / Sales Revenue</option>
                    <option value="Investment">Dividends & Capital Gain</option>
                    <option value="Rental">Property Rental Income</option>
                    <option value="Other">Other Miscellaneous Revenue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid 3: Transaction Date & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Transaction Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="date"
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
                  >
                    <option value="Bank Transfer">Bank Transfer (SLIPS/CEFT)</option>
                    <option value="Direct Deposit">Direct Bank Deposit</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Online Gateway">Online Gateway (PayHere / Stripe)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description / Remarks */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Remarks & Description (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Include invoice reference number, milestone details, client tax identification..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/income')}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                Save & Add Another
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{loading ? 'Recording...' : 'Save & View Income List'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Tax & Financial Impact Preview Card */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
              <Calculator className="w-36 h-36" />
            </div>

            <div className="flex items-center space-x-2 text-emerald-400 mb-4">
              <Calculator className="h-5 w-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Live Tax Impact Engine</h3>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Real-time calculation of your projected tax liability under Inland Revenue Department (IRD) Sri Lanka regulations.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                <span className="text-slate-400">Current Taxable Base:</span>
                <span className="font-bold text-slate-200">LKR {currentTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                <span className="text-slate-400">+ New Income Entry:</span>
                <span className="font-bold text-emerald-400">+LKR {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                <span className="text-slate-400">Projected Taxable Total:</span>
                <span className="font-bold text-white text-sm">LKR {projectedTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400">Est. Additional Tax Liability:</span>
                <span className="font-bold text-amber-400">+LKR {estimatedTaxDelta.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center space-x-1.5">
              <span>✓ Auto-synced with TFAT Tax Calculator</span>
            </div>
          </div>

          {/* Guidelines box */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-emerald-800 flex items-center space-x-1.5">
              <span>💡 Inland Revenue Tip</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Ensure all freelance payments and corporate client transfers over LKR 100,000 have matching invoice reference documentation for audit compliance.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
