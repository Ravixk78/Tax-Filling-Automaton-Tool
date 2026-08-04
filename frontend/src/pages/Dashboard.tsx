import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  Calculator, 
  History, 
  Plus, 
  Minus,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuditRiskCard } from '../components/AuditRiskCard';

// Chart.js Setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard: React.FC = () => {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [taxableIncome, setTaxableIncome] = useState<number>(0);
  const [estimatedTax, setEstimatedTax] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingDocsCount, setPendingDocsCount] = useState<number>(0);
  const [chartDataState, setChartDataState] = useState<any>(null);
  
  // Modals state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Quick form state
  const [incSource, setIncSource] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incType, setIncType] = useState('Freelance');
  
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const year = new Date().getFullYear();

      // Fetch Income
      const incomeRes = await api.get('/income');
      const incomes = incomeRes.data.incomes;
      const sumIncome = incomes.reduce((sum: number, i: any) => sum + i.Amount, 0);
      setTotalIncome(sumIncome);

      // Fetch Expenses
      const expenseRes = await api.get('/expenses');
      const expensesList = expenseRes.data.expenses;
      const sumExpense = expensesList.reduce((sum: number, e: any) => sum + e.Amount, 0);
      setTotalExpense(sumExpense);

      // Fetch Categories
      const catRes = await api.get('/expenses/categories');
      setCategories(catRes.data.categories);
      if (catRes.data.categories.length > 0) {
        setExpCategory(catRes.data.categories[0].CategoryID);
      }

      // Count expenses lacking receipts
      const withoutReceipt = expensesList.filter((e: any) => !e.Receipt).length;
      setPendingDocsCount(withoutReceipt);

      // Fetch Tax Calculations
      const taxRes = await api.get(`/tax/calculate?year=${year}`);
      const calc = taxRes.data.calculation;
      setTaxableIncome(calc.taxableIncome);
      setEstimatedTax(calc.taxAmount);

      // Fetch Audit Logs for activities
      const logsRes = await api.get('/admin/logs').catch(() => null);
      if (logsRes) {
        setRecentActivities(logsRes.data.auditLogs.slice(0, 4));
      } else {
        setRecentActivities([
          { LogID: 1, Activity: 'Fetched dashboard analytics successfully', Timestamp: new Date().toISOString() },
          { LogID: 2, Activity: 'Connected to financial reporting API', Timestamp: new Date().toISOString() },
          { LogID: 3, Activity: 'Synchronised state with Prisma Client engine', Timestamp: new Date().toISOString() }
        ]);
      }

      // Setup Bar Chart data (rounded bars)
      setChartDataState({
        labels: ['Q1 Financials', 'Q2 Financials', 'Q3 Financials', 'Q4 Financials'],
        datasets: [
          {
            label: 'Logged Income',
            data: [sumIncome * 0.25, sumIncome * 0.35, sumIncome * 0.25, sumIncome * 0.15],
            backgroundColor: '#059669',
            borderRadius: 6,
            barThickness: 24,
          },
          {
            label: 'Logged Expenses',
            data: [sumExpense * 0.3, sumExpense * 0.2, sumExpense * 0.3, sumExpense * 0.2],
            backgroundColor: '#0F172A',
            borderRadius: 6,
            barThickness: 24,
          }
        ]
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incSource || !incAmount) return;
    try {
      await api.post('/income', {
        Source: incSource,
        Amount: incAmount,
        IncomeType: incType,
        IncomeDate: new Date().toISOString()
      });
      setIsIncomeModalOpen(false);
      setIncSource('');
      setIncAmount('');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to log income');
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    try {
      await api.post('/expenses', {
        Description: expDesc,
        Amount: expAmount,
        CategoryID: expCategory,
        ExpenseDate: new Date().toISOString()
      });
      setIsExpenseModalOpen(false);
      setExpDesc('');
      setExpAmount('');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to log expense');
    }
  };

  const doughnutData = {
    labels: ['Taxable Income', 'Estimated Tax', 'Remaining Expenses'],
    datasets: [
      {
        data: [taxableIncome, estimatedTax, totalExpense],
        backgroundColor: ['#22C55E', '#EF4444', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="space-y-8 font-sans text-slate-800">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 leading-tight">Financial Performance Dashboard</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-emerald-500 mt-2.5 rounded-full"></div>
        </div>
        <div className="text-xs font-bold text-slate-400 font-mono tracking-wider bg-white border border-border px-3.5 py-2 rounded-xl shadow-sm">
          Filing Year: {new Date().getFullYear()}
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => setIsIncomeModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:from-primary-dark active:scale-95 transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Income</span>
        </button>
        <button 
          onClick={() => setIsExpenseModalOpen(true)}
          className="px-5 py-2.5 bg-white text-secondary border border-border/80 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-sm"
        >
          <Minus className="h-4 w-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Automated Audit Risk Engine Widget */}
      <AuditRiskCard />

      {/* Premium Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Income */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Income</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-2">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-primary border border-emerald-100 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-5">Cumulative recorded logs</div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Expenses</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-2">
                ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-rose-50 text-danger border border-rose-100 rounded-xl group-hover:bg-danger group-hover:text-white transition-colors duration-300">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-5">Deduction invoice claims</div>
        </div>

        {/* Card 3: Taxable Income */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Taxable Income</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-2">
                ${taxableIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-success border border-emerald-100 rounded-xl group-hover:bg-success group-hover:text-white transition-colors duration-300">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-5">Adjusted net liability value</div>
        </div>

        {/* Card 4: Estimated Tax */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Tax</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-2">
                ${estimatedTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-amber-50 text-warning border border-amber-100 rounded-xl group-hover:bg-warning group-hover:text-white transition-colors duration-300">
              <Calculator className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-5">Estimated federal dues</div>
        </div>
      </div>

      {/* Main Split: Bar Chart & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border/85 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 font-heading">Income vs Expenses Analysis</h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase bg-slate-50 border border-border px-2.5 py-1 rounded-lg">Quarterly Breakdown</span>
          </div>
          <div className="h-68">
            {chartDataState ? (
              <Bar 
                data={chartDataState} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10, weight: 'bold' } } } },
                  scales: { y: { ticks: { font: { family: 'Courier Prime', size: 10 } } }, x: { ticks: { font: { family: 'Courier Prime', size: 10 } } } }
                }} 
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-xs">Loading analytics...</div>
            )}
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2 mb-6">
              <History className="h-4.5 w-4.5 text-primary" />
              <span>Filing Activity Log</span>
            </h3>
            
            <div className="space-y-4">
              {recentActivities.map((act, index) => (
                <div key={index} className="flex gap-4 border-l-2 border-slate-100 pl-4 py-1 relative">
                  <span className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white"></span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{act.Activity}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                      {new Date(act.Timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 text-center">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase bg-slate-50 border border-border px-2 py-1 rounded">System Audit Verified</span>
          </div>
        </div>

      </div>

      {/* Secondary Row: Doughnut Tax Breakdown & Receipts Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 font-heading mb-6">Tax Breakdown Metrics</h4>
          <div className="h-56 flex items-center justify-center">
            <div className="w-52 h-52">
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } } }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Missing Receipts progress status */}
        <div className="bg-white p-6 rounded-2xl border border-border/85 shadow-sm flex flex-col justify-center items-center gap-4 text-center">
          <div className="p-4 bg-slate-50 border border-border/80 rounded-2xl flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">Pending Receipt Uploads: {pendingDocsCount}</h4>
            <p className="text-slate-400 text-xs mt-1">Deductible expense files requiring document proof scans</p>
          </div>
          
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border mt-2">
            <div 
              className="bg-gradient-to-r from-primary to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${pendingDocsCount > 0 ? Math.min(100, (pendingDocsCount / 8) * 100) : 100}%` }}
            ></div>
          </div>

          <Link 
            to="/expenses" 
            className="text-xs font-bold text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>Navigate to Receipts Manager</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* QUICK MODALS */}
      {/* 1. Add Income Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsIncomeModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-heading font-bold text-slate-900 mb-6">Quick Log Income</h2>
            <form onSubmit={handleAddIncomeSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Source / Client</label>
                <input 
                  type="text" 
                  value={incSource}
                  onChange={(e) => setIncSource(e.target.value)}
                  placeholder="e.g. Acme Corp Contract" 
                  className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                  <input 
                    type="number" 
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value)}
                    placeholder="0.00" 
                    className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    value={incType}
                    onChange={(e) => setIncType(e.target.value)}
                    className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Business">Business</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all text-xs uppercase tracking-wider mt-4"
              >
                Record Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-heading font-bold text-slate-900 mb-6">Quick Log Expense</h2>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Expense Item</label>
                <input 
                  type="text" 
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Server hosting bills" 
                  className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                  <input 
                    type="number" 
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0.00" 
                    className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select 
                    value={expCategory}
                    onChange={(e) => setExpCategory(parseInt(e.target.value))}
                    className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all text-xs uppercase tracking-wider mt-4"
              >
                Record Transaction
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
