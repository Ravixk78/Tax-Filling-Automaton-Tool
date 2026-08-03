import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { BankStatementIngestModal } from '../components/BankStatementIngestModal';

export const Income: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  // State
  const [incomes, setIncomes] = useState<any[]>([]);
  const [search, setSearch] = useState<string>(initialSearch);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  
  // Modal state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [source, setSource] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('Freelance');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 5;

  const fetchIncomes = async () => {
    try {
      const res = await api.get(`/income?search=${search}&type=${typeFilter}`);
      setIncomes(res.data.incomes);
    } catch (err) {
      console.error('Failed to fetch incomes:', err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [search, typeFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setSource('');
    setAmount('');
    setType('Freelance');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsOpen(true);
  };

  const handleOpenEdit = (income: any) => {
    setEditingId(income.IncomeID);
    setSource(income.Source);
    setAmount(income.Amount.toString());
    setType(income.IncomeType);
    setDate(new Date(income.IncomeDate).toISOString().split('T')[0]);
    setDescription(income.Description || '');
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      await api.delete(`/income/${id}`);
      fetchIncomes();
    } catch (err) {
      alert('Failed to delete income record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !date) {
      alert('Please fill in all mandatory fields');
      return;
    }

    const payload = {
      Source: source,
      Amount: parseFloat(amount),
      IncomeType: type,
      Description: description || null,
      IncomeDate: new Date(date).toISOString()
    };

    try {
      if (editingId) {
        await api.put(`/income/${editingId}`, payload);
      } else {
        await api.post('/income', payload);
      }
      setIsOpen(false);
      fetchIncomes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save income record');
    }
  };

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = incomes.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(incomes.length / recordsPerPage) || 1;

  return (
    <div className="space-y-6 font-sans text-slate-800 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Income Management</h1>
          <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-4 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <TrendingUp className="h-4.5 w-4.5" />
            <span>Auto Ingest Bank Statement</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 border border-border shadow-sm rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1 max-w-2xl">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description or client..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
            />
          </div>

          {/* Type Category Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            >
              <option value="">All Types</option>
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Business">Business</option>
              <option value="Investment">Investment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="text-xs font-mono text-slate-400 font-medium">
          Total Incomes: {incomes.length} records
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Source / Client</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Income Type</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {currentRecords.length > 0 ? (
                currentRecords.map((item) => (
                  <tr key={item.IncomeID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{item.Source}</td>
                    <td className="py-4 px-6 font-mono text-primary font-bold">
                      ${Number(item.Amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                        {item.IncomeType}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">
                      {new Date(item.IncomeDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate">{item.Description || '-'}</td>
                    <td className="py-4 px-6 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                        title="Edit Record"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.IncomeID)}
                        className="p-1.5 text-slate-500 hover:text-danger hover:bg-red-50 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No income records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="bg-white border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, incomes.length)} of {incomes.length} entries
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border rounded hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded text-xs font-bold font-mono transition-colors ${
                  currentPage === p
                    ? 'bg-primary text-white'
                    : 'border border-border hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border rounded hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CRUD MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
            
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5.5 w-5.5 text-primary" />
              <span>{editingId ? 'Edit Income Transaction' : 'Record New Income'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Source */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source / Client Name</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Acme Corp Contract"
                  className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Type Category */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Income Type Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                >
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Business">Business</option>
                  <option value="Investment">Investment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter invoice details, project milestones, or remarks..."
                  rows={3}
                  className="p-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BankStatementIngestModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSuccess={fetchIncomes}
      />

    </div>
  );
};
