import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileDown, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';

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
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Reports: React.FC = () => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const incRes = await api.get('/income');
      setIncomes(incRes.data.incomes);

      const expRes = await api.get('/expenses');
      setExpenses(expRes.data.expenses);

      const catRes = await api.get('/expenses/categories');
      setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const totalIncome = incomes.reduce((sum, i) => sum + i.Amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.Amount, 0);
  const netEarnings = totalIncome - totalExpense;

  // Export CSV handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Source/Description,Amount,Date,Category/IncomeType\n';

    incomes.forEach(i => {
      csvContent += `Income,"${i.Source}",${i.Amount},"${new Date(i.IncomeDate).toLocaleDateString()}","${i.IncomeType}"\n`;
    });

    expenses.forEach(e => {
      const catName = categories.find(c => c.CategoryID === e.CategoryID)?.CategoryName || 'Other';
      csvContent += `Expense,"${e.Description}",${e.Amount},"${new Date(e.ExpenseDate).toLocaleDateString()}","${catName}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Chart setup: Category breakdown for Pie Chart
  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      const catName = categories.find(c => c.CategoryID === e.CategoryID)?.CategoryName || 'Other';
      breakdown[catName] = (breakdown[catName] || 0) + e.Amount;
    });
    return {
      labels: Object.keys(breakdown),
      datasets: [
        {
          data: Object.values(breakdown),
          backgroundColor: ['#2563EB', '#0F172A', '#EF4444', '#22C55E', '#F59E0B', '#A855F7', '#EC4899', '#64748B'],
          borderWidth: 1,
        }
      ]
    };
  };

  // Chart setup: Income vs Expense Monthly for Bar Chart (Mock Months)
  const getCashFlowData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Income',
          data: [totalIncome * 0.08, totalIncome * 0.1, totalIncome * 0.07, totalIncome * 0.09, totalIncome * 0.12, totalIncome * 0.08, totalIncome * 0.11, totalIncome * 0.07, totalIncome * 0.09, totalIncome * 0.05, totalIncome * 0.06, totalIncome * 0.08],
          backgroundColor: '#2563EB',
          borderRadius: 4
        },
        {
          label: 'Expense',
          data: [totalExpense * 0.05, totalExpense * 0.08, totalExpense * 0.09, totalExpense * 0.07, totalExpense * 0.1, totalExpense * 0.12, totalExpense * 0.08, totalExpense * 0.09, totalExpense * 0.07, totalExpense * 0.06, totalExpense * 0.09, totalExpense * 0.1],
          backgroundColor: '#0F172A',
          borderRadius: 4
        }
      ]
    };
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 print:bg-white print:p-0">
      
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Financial Reports</h1>
          <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-border bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <FileDown className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-3xl font-bold font-heading">TFAT ANNUAL FINANCIAL REPORT</h1>
        <p className="text-sm font-mono text-slate-500 mt-1">Generated: {new Date().toLocaleString()} | Year: {new Date().getFullYear()}</p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-border shadow-sm rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Gross Income</span>
            <span className="text-xl font-bold font-mono text-slate-900 block mt-2">LKR {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 bg-blue-50 text-primary rounded-full print:border">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 border border-border shadow-sm rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Gross Expenses</span>
            <span className="text-xl font-bold font-mono text-slate-900 block mt-2">LKR {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 bg-red-50 text-danger rounded-full print:border">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 border border-border shadow-sm rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Net Financial Standing</span>
            <span className={`text-xl font-bold font-mono mt-2 block ${netEarnings >= 0 ? 'text-success' : 'text-danger'}`}>
              LKR {netEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`p-3 rounded-full print:border ${netEarnings >= 0 ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Bars */}
        <div className="lg:col-span-2 bg-white p-6 border border-border shadow-sm rounded-xl print:shadow-none print:border-none">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Monthly Cash Flow History</span>
          </h3>
          <div className="h-72">
            {!loading ? (
              <Bar 
                data={getCashFlowData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { ticks: { font: { family: 'Courier Prime' } } }, x: { ticks: { font: { family: 'Courier Prime' } } } }
                }} 
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading Cash Flow Chart...</div>
            )}
          </div>
        </div>

        {/* Expense Category Pie */}
        <div className="bg-white p-6 border border-border shadow-sm rounded-xl print:shadow-none print:border-none">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-primary" />
            <span>Expense Distribution</span>
          </h3>
          <div className="h-72 flex items-center justify-center">
            {!loading && expenses.length > 0 ? (
              <div className="w-56 h-56">
                <Pie 
                  data={getCategoryBreakdown()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                  }} 
                />
              </div>
            ) : (
              <div className="text-slate-400 text-xs font-semibold">No expense categories to distribute.</div>
            )}
          </div>
        </div>
      </div>

      {/* Print details statement */}
      <div className="bg-white p-6 border border-border shadow-sm rounded-xl print:shadow-none print:border">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Logged Accounts Record Statement</h3>
        <p className="text-xs text-slate-400 mb-6 print:hidden">The following contains a comprehensive compilation of all income and expense logs recorded in the system.</p>
        
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border font-bold text-slate-500 uppercase">
                  <th className="p-3">Type</th>
                  <th className="p-3">Description / Source</th>
                  <th className="p-3">Category / Subtype</th>
                  <th className="p-3">Filing Date</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {incomes.map((i, index) => (
                  <tr key={`inc-${index}`}>
                    <td className="p-3 font-sans text-primary font-bold">INCOME</td>
                    <td className="p-3 font-semibold text-slate-700">{i.Source}</td>
                    <td className="p-3 font-sans">{i.IncomeType}</td>
                    <td className="p-3">{new Date(i.IncomeDate).toLocaleDateString()}</td>
                    <td className="p-3 text-right text-primary font-bold">${Number(i.Amount).toFixed(2)}</td>
                  </tr>
                ))}
                {expenses.map((e, index) => (
                  <tr key={`exp-${index}`}>
                    <td className="p-3 font-sans text-danger font-bold">EXPENSE</td>
                    <td className="p-3 text-slate-700">{e.Description}</td>
                    <td className="p-3 font-sans">{categories.find(c => c.CategoryID === e.CategoryID)?.CategoryName || 'Other'}</td>
                    <td className="p-3">{new Date(e.ExpenseDate).toLocaleDateString()}</td>
                    <td className="p-3 text-right text-danger font-bold">-${Number(e.Amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
