import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  UserPlus, 
  UserMinus, 
  FileText, 
  Calculator, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  Eye
} from 'lucide-react';

export const AccountantDashboard: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  
  const [clientEmail, setClientEmail] = useState<string>('');
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientReturns, setClientReturns] = useState<any[]>([]);
  const [isReturnsOpen, setIsReturnsOpen] = useState<boolean>(false);
  
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<string>('Approved');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');

  const fetchClients = async () => {
    try {
      const res = await api.get('/accountant/clients');
      setClients(res.data.clients);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAssignClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError(null);
    if (!clientEmail) return;

    try {
      await api.post('/accountant/clients', { clientEmail });
      setIsAssignOpen(false);
      setClientEmail('');
      fetchClients();
    } catch (err: any) {
      setAssignError(err.response?.data?.error || 'Failed to assign client. Make sure the taxpayer exists.');
    }
  };

  const handleRemoveClient = async (clientId: number) => {
    if (!window.confirm('Are you sure you want to remove this client?')) return;
    try {
      await api.delete(`/accountant/clients/${clientId}`);
      fetchClients();
    } catch (err) {
      alert('Failed to remove client');
    }
  };

  const handleOpenReturns = async (client: any) => {
    setSelectedClient(client);
    try {
      const res = await api.get(`/tax/returns?userId=${client.UserID}`);
      setClientReturns(res.data.taxReturns);
      setIsReturnsOpen(true);
    } catch (err) {
      alert('Failed to fetch client tax returns.');
    }
  };

  const handleOpenReview = (ret: any) => {
    setSelectedReturn(ret);
    setReviewStatus('Approved');
    setReviewRemarks('');
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    try {
      await api.post(`/accountant/returns/${selectedReturn.ReturnID}/review`, {
        status: reviewStatus,
        remarks: reviewRemarks
      });
      setIsReviewOpen(false);
      
      const res = await api.get(`/tax/returns?userId=${selectedClient.UserID}`);
      setClientReturns(res.data.taxReturns);
    } catch (err) {
      alert('Failed to submit return review.');
    }
  };

  const handleSubmitOnBehalf = async (returnId: number) => {
    if (!window.confirm('Submit this return to Tax Authority on client behalf?')) return;
    try {
      await api.post(`/accountant/returns/${returnId}/submit`);
      const res = await api.get(`/tax/returns?userId=${selectedClient.UserID}`);
      setClientReturns(res.data.taxReturns);
      alert('Filing successfully submitted on client behalf.');
    } catch (err) {
      alert('Failed to submit return on client behalf.');
    }
  };

  const filteredClients = clients.filter(c => 
    c.Name.toLowerCase().includes(search.toLowerCase()) || 
    c.Email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Client Management</h1>
          <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
        </div>
        <button
          onClick={() => setIsAssignOpen(true)}
          className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-4 border border-border shadow-sm rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="text-xs font-mono text-slate-400 font-medium">
          Active Clients: {filteredClients.length} assigned
        </div>
      </div>

      {/* Clients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? (
          filteredClients.map(c => (
            <div key={c.UserID} className="bg-white p-6 border border-border shadow-sm rounded-xl flex flex-col justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold">
                  {c.Name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 leading-tight">{c.Name}</h3>
                  <span className="text-xs font-mono text-slate-400">{c.Email}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs border-t border-b border-slate-50 py-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Role Profile</span>
                  <span className="capitalize">{c.Role}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenReturns(c)}
                  className="flex-1 py-2 bg-slate-50 text-slate-700 border border-border rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span>Returns</span>
                </button>
                
                <button
                  onClick={() => handleRemoveClient(c.UserID)}
                  className="px-3 py-2 border border-red-200 text-danger hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                  title="Unassign Client"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 border border-border rounded-xl text-center text-slate-400">
            <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-sm">No clients assigned.</p>
            <p className="text-xs text-slate-300 mt-1">Click Add Client to map taxpayer credentials.</p>
          </div>
        )}
      </div>

      {/* ASSIGN CLIENT DIALOG */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsAssignOpen(false)}
            >
              &times;
            </button>

            <h2 className="text-xl font-heading font-bold text-slate-900 mb-2 flex items-center gap-2">
              <UserPlus className="h-5.5 w-5.5 text-primary" />
              <span>Assign New Client</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">Enter the exact registered email address of the taxpayer account.</p>

            {assignError && (
              <div className="bg-red-50 text-danger border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-4 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignClient} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="taxpayer@example.com"
                  className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-sm"
                >
                  Add Client Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT RETURNS MODAL OVERLAY */}
      {isReturnsOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-xl shadow-xl max-w-3xl w-full p-6 relative flex flex-col gap-4">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsReturnsOpen(false)}
            >
              &times;
            </button>

            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="h-5.5 w-5.5 text-primary" />
                <span>Tax Filings: {selectedClient.Name}</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">{selectedClient.Email}</span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border font-bold text-slate-500 uppercase">
                    <th className="p-3">Year</th>
                    <th className="p-3">Total Income</th>
                    <th className="p-3">Total Expense</th>
                    <th className="p-3">Tax Payable</th>
                    <th className="p-3">Filing Status</th>
                    <th className="p-3 text-center">Filing Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-sm">
                  {clientReturns.length > 0 ? (
                    clientReturns.map(r => (
                      <tr key={r.ReturnID} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold font-sans">{r.TaxYear}</td>
                        <td className="p-3">${Number(r.TotalIncome).toLocaleString()}</td>
                        <td className="p-3">${Number(r.TotalExpense).toLocaleString()}</td>
                        <td className="p-3 text-primary font-bold">${Number(r.TaxAmount).toLocaleString()}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.Status === 'Approved' ? 'bg-green-50 text-success border border-green-200' :
                            r.Status === 'Rejected' ? 'bg-red-50 text-danger border border-red-200' :
                            r.Status === 'Submitted' ? 'bg-blue-50 text-primary border border-blue-200' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {r.Status}
                          </span>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-1.5 font-sans">
                          {r.Status === 'Submitted' ? (
                            <button
                              onClick={() => handleOpenReview(r)}
                              className="px-2 py-1 bg-primary text-white hover:bg-primary-dark rounded text-[10px] font-bold"
                            >
                              Review Filing
                            </button>
                          ) : r.Status === 'Pending' ? (
                            <button
                              onClick={() => handleSubmitOnBehalf(r.ReturnID)}
                              className="px-2 py-1 border border-border text-slate-600 hover:text-primary rounded text-[10px] font-bold"
                            >
                              Submit on Behalf
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-sans text-xs">
                        No returns have been generated by this client yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsReturnsOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN REVIEW MODAL OVERLAY */}
      {isReviewOpen && selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsReviewOpen(false)}
            >
              &times;
            </button>

            <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">Review Tax Return</h2>
            <p className="text-xs text-slate-400 mb-6">Reviewing Return ID {selectedReturn.ReturnID} (Tax Year {selectedReturn.TaxYear}).</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              
              {/* Status Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filing Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none"
                >
                  <option value="Approved">Approve Filing</option>
                  <option value="Rejected">Reject / Request Edits</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Review Remarks / Feedback</label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter comments for approval, or detail why the return is being sent back for modification..."
                  rows={4}
                  className="p-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-sm"
                >
                  Submit Audit Decision
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
