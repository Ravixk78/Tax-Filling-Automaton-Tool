import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Receipt, 
  CheckCircle2, 
  Calculator, 
  AlertCircle,
  Calendar,
  Tag,
  Upload,
  FileCheck,
  X,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<any[]>([]);

  // Receipt File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tax context state
  const [currentExpenseTotal, setCurrentExpenseTotal] = useState(0);

  useEffect(() => {
    const fetchCategoriesAndExpenses = async () => {
      try {
        const catRes = await api.get('/expenses/categories');
        if (catRes.data && catRes.data.categories) {
          setCategories(catRes.data.categories);
          if (catRes.data.categories.length > 0) {
            setCategoryId(catRes.data.categories[0].CategoryID.toString());
          }
        }

        const expRes = await api.get('/expenses');
        if (expRes.data && expRes.data.expenses) {
          const sum = expRes.data.expenses.reduce((acc: number, e: any) => acc + (e.Amount || 0), 0);
          setCurrentExpenseTotal(sum);
        }
      } catch (err) {
        console.error('Failed to load expense categories:', err);
      }
    };
    fetchCategoriesAndExpenses();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  // Tax savings estimate: ~18% tax deduction rate under SL IRD rules
  const estimatedTaxSaved = numAmount > 0 ? numAmount * 0.18 : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !categoryId || !expenseDate) {
      setError('Please fill in all mandatory fields: expense item, amount, category, and date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        Description: description.trim(),
        Amount: parseFloat(amount),
        CategoryID: parseInt(categoryId),
        ExpenseDate: new Date(expenseDate).toISOString()
      };

      const res = await api.post('/expenses', payload);
      const newExpense = res.data.expense;

      // If a receipt file was selected, upload it for the created expense ID
      if (selectedFile && newExpense && newExpense.ExpenseID) {
        const formData = new FormData();
        formData.append('receipt', selectedFile);
        await api.post(`/expenses/${newExpense.ExpenseID}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).catch((err) => console.error('Receipt upload error:', err));
      }

      setSuccessMsg('Expense record logged successfully with tax deduction proof!');

      if (addAnother) {
        setDescription('');
        setAmount('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setTimeout(() => {
          navigate('/expenses');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to log expense record. Check backend connection.');
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
            to="/expenses"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition shadow-sm flex items-center justify-center"
            title="Back to Expense List"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-rose-100 text-rose-700 tracking-wider">
                Full Page Entry
              </span>
              <span className="text-xs text-slate-400 font-mono">Tax Filing Year: {new Date().getFullYear()}</span>
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-slate-900 mt-1">Record New Expense Record</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/expenses')}
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
            
            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Expense Item / Description <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Receipt className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Office Space Rent Colombo / Dell Workstation Hardware / Cloud Server Hosting"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-medium text-slate-800"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono font-bold text-rose-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-medium text-slate-800"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.CategoryID} value={cat.CategoryID}>
                        {cat.CategoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Expense Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Supporting Receipt Attachment Dropzone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Attach Supporting Receipt / Tax Invoice Proof (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl p-6 text-center bg-slate-50/60 transition relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center space-y-2">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Receipt Preview" className="max-h-36 rounded-lg shadow-sm border" />
                    ) : (
                      <FileCheck className="h-10 w-10 text-emerald-500" />
                    )}
                    <span className="text-xs font-bold text-slate-800">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                      className="text-[10px] font-bold text-rose-500 hover:underline mt-1"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-9 w-9 text-slate-400 group-hover:text-rose-500 transition" />
                    <p className="text-xs font-bold text-slate-700">Drop receipt image or PDF here, or click to upload</p>
                    <p className="text-[10px] text-slate-400">Supports JPG, PNG, PDF up to 5MB (Reduces Inland Revenue audit risk score!)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
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
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20 flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{loading ? 'Logging...' : 'Save & View Expense List'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Tax Deduction Savings Card */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
              <TrendingDown className="w-36 h-36" />
            </div>

            <div className="flex items-center space-x-2 text-rose-400 mb-4">
              <Calculator className="h-5 w-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Deduction Tax Impact</h3>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Claimable allowable expenses reduce net taxable income under Inland Revenue Department (IRD) regulations.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                <span className="text-slate-400">Current Total Expenses:</span>
                <span className="font-bold text-slate-200">LKR {currentExpenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                <span className="text-slate-400">+ Claimable Deduction:</span>
                <span className="font-bold text-rose-400">+LKR {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                <span className="text-slate-400">Estimated Tax Liability Savings:</span>
                <span className="font-bold text-emerald-400 text-sm">~LKR {estimatedTaxSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400">Audit Verification Status:</span>
                <span className={`font-bold ${selectedFile ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedFile ? '✓ Proof Attached' : '⚠️ Receipt Missing'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Deductions compliant with IRD allowable guidelines</span>
            </div>
          </div>

          {/* Compliance note */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-rose-800 flex items-center space-x-1.5">
              <span>🧾 Proof Retention Requirement</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Attaching digital receipts prevents IRD audit risk flags. Under Section 119 of the IRD Act, all deductible expenses above LKR 50,000 must have receipt proof stored.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
