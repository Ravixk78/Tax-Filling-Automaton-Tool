import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  Upload,
  FileCheck,
  X,
  FileText,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { OCRScannerModal } from '../components/OCRScannerModal';

export const Expenses: React.FC = () => {
  // State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('');

  // OCR Modal state
  const [isOcrOpen, setIsOcrOpen] = useState<boolean>(false);

  // CRUD Modals state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [desc, setDesc] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Upload Receipt state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 5;

  const fetchExpensesAndCategories = async () => {
    try {
      const catRes = await api.get('/expenses/categories');
      setCategories(catRes.data.categories);

      const expRes = await api.get(`/expenses?search=${search}&categoryId=${catFilter}`);
      setExpenses(expRes.data.expenses);

      if (catRes.data.categories.length > 0 && !categoryId) {
        setCategoryId(catRes.data.categories[0].CategoryID.toString());
      }
    } catch (err) {
      console.error('Failed to load expenses/categories:', err);
    }
  };

  useEffect(() => {
    fetchExpensesAndCategories();
  }, [search, catFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    if (categories.length > 0) {
      setCategoryId(categories[0].CategoryID.toString());
    }
    setDate(new Date().toISOString().split('T')[0]);
    setIsOpen(true);
  };

  const handleOpenEdit = (exp: any) => {
    setEditingId(exp.ExpenseID);
    setDesc(exp.Description);
    setAmount(exp.Amount.toString());
    setCategoryId(exp.CategoryID.toString());
    setDate(new Date(exp.ExpenseDate).toISOString().split('T')[0]);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpensesAndCategories();
    } catch (err) {
      alert('Failed to delete expense record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !categoryId || !date) {
      alert('All fields are required.');
      return;
    }

    const payload = {
      Description: desc,
      Amount: parseFloat(amount),
      CategoryID: parseInt(categoryId),
      ExpenseDate: new Date(date).toISOString()
    };

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      setIsOpen(false);
      fetchExpensesAndCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save expense record');
    }
  };

  // Receipt upload handling
  const handleOpenUpload = (expenseId: number) => {
    setSelectedExpenseId(expenseId);
    setSelectedFile(null);
    setUploadError(null);
    setIsUploadOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Only images (JPG/PNG) or PDF receipt files are supported.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File exceeds maximum 5MB size limit.');
        setSelectedFile(null);
        return;
      }
      setUploadError(null);
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpenseId || !selectedFile) {
      setUploadError('Please select a valid receipt document first.');
      return;
    }
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      await api.post(`/expenses/${selectedExpenseId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploadOpen(false);
      fetchExpensesAndCategories();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload failed. Check server connection.');
    } finally {
      setUploading(false);
    }
  };

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = expenses.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(expenses.length / recordsPerPage) || 1;

  // Find Category Name by ID helper
  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.CategoryID === catId);
    return cat ? cat.CategoryName : 'Other';
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Expenses</h1>
          <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsOcrOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Receipt className="h-4.5 w-4.5" />
            <span>Smart OCR Scan</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Expense</span>
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
              placeholder="Search expenses by description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={catFilter}
              onChange={(e) => { setCatFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 font-medium">
          Total Expenses: {expenses.length} records
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Expense Item / Description</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Receipt File</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {currentRecords.length > 0 ? (
                currentRecords.map((item) => (
                  <tr key={item.ExpenseID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{item.Description}</td>
                    <td className="py-4 px-6 font-mono text-danger font-bold">
                      ${Number(item.Amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                        {getCategoryName(item.CategoryID)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">
                      {new Date(item.ExpenseDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {item.Receipt ? (
                        <a 
                          href={`http://localhost:5000${item.Receipt.FilePath}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-success hover:underline font-semibold"
                        >
                          <FileCheck className="h-4 w-4" />
                          <span>{item.Receipt.FileName.substring(0, 16)}...</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => handleOpenUpload(item.ExpenseID)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Receipt</span>
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                        title="Edit Expense"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.ExpenseID)}
                        className="p-1.5 text-slate-500 hover:text-danger hover:bg-red-50 rounded transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No expense records logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="bg-white border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, expenses.length)} of {expenses.length} entries
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

      {/* ADD/EDIT CRUD MODAL */}
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
              <Receipt className="h-5.5 w-5.5 text-primary" />
              <span>{editingId ? 'Edit Expense Record' : 'Record New Expense'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Name / Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Office Stationery Supplies"
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                >
                  {categories.map(c => (
                    <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                  ))}
                </select>
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
                  {editingId ? 'Save Changes' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD RECEIPT MODAL DIALOG */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsUploadOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-heading font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="h-5.5 w-5.5 text-primary" />
              <span>Upload Supporting Receipt</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">Attach a PDF invoice or screenshot image (JPG/PNG) as proof of purchase.</p>

            {uploadError && (
              <div className="bg-red-50 text-danger border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-4 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Drag-and-drop / Select Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-10 w-10 text-success" />
                    <span className="text-sm font-semibold text-slate-700">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-slate-300" />
                    <span className="text-sm font-medium text-slate-600">Drag file here or click to browse</span>
                    <span className="text-xs text-slate-400 uppercase">Supported: JPG, PNG, PDF (Max 5MB)</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <OCRScannerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onSuccess={fetchExpensesAndCategories}
      />

    </div>
  );
};
