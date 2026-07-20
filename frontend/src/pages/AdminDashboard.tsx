
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShieldAlert, 
  Search, 
  UserX, 
  UserCheck, 
  FileText, 
  Percent, 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  Cpu, 
  Database, 
  HardDrive, 
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Users');
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState<string>('');
  const [rules, setRules] = useState<any[]>([]);
  const [isRuleOpen, setIsRuleOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleDesc, setRuleDesc] = useState<string>('');
  const [ruleRate, setRuleRate] = useState<string>('');
  const [ruleDate, setRuleDate] = useState<string>(new Date().toISOString().split('T')[0]);


  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchAudit, setSearchAudit] = useState<string>('');

  
  const [systemHealth, setSystemHealth] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await api.get('/admin/rules');
      setRules(res.data.taxRules);
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/logs');
      setAuditLogs(res.data.auditLogs);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await api.get('/admin/health');
      setSystemHealth(res.data.health);
    } catch (err) {
      console.error('Failed to load health:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRules();
    fetchAuditLogs();
    fetchHealth();

    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if (!window.confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      fetchUsers();
      fetchAuditLogs();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleDesc('');
    setRuleRate('');
    setRuleDate(new Date().toISOString().split('T')[0]);
    setIsRuleOpen(true);
  };

  const handleOpenEditRule = (rule: any) => {
    setEditingRuleId(rule.RuleID);
    setRuleName(rule.RuleName);
    setRuleDesc(rule.Description || '');
    setRuleRate(rule.TaxRate.toString());
    setRuleDate(new Date(rule.EffectiveDate).toISOString().split('T')[0]);
    setIsRuleOpen(true);
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Delete this tax rule permanently?')) return;
    try {
      await api.delete(`/admin/rules/${id}`);
      fetchRules();
      fetchAuditLogs();
    } catch (err) {
      alert('Failed to delete tax rule');
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !ruleRate || !ruleDate) {
      alert('Rule name, Tax rate and Effective date are required.');
      return;
    }

    const payload = {
      RuleName: ruleName,
      Description: ruleDesc || null,
      EffectiveDate: new Date(ruleDate).toISOString(),
      TaxRate: parseFloat(ruleRate)
    };

    try {
      if (editingRuleId) {
        await api.put(`/admin/rules/${editingRuleId}`, payload);
      } else {
        await api.post('/admin/rules', payload);
      }
      setIsRuleOpen(false);
      fetchRules();
      fetchAuditLogs();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save tax rule');
    }
  };

  const filteredUsers = users.filter(u => 
    u.Name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.Email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.Role.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l => 
    l.Activity.toLowerCase().includes(searchAudit.toLowerCase()) ||
    l.IPAddress.toLowerCase().includes(searchAudit.toLowerCase()) ||
    l.UserID.toString().includes(searchAudit)
  );

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Administration Portal</h1>
        <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white p-2 border border-border shadow-sm rounded-xl flex gap-2 overflow-x-auto">
        {[
          { name: 'Users', label: 'Manage Users' },
          { name: 'Rules', label: 'Tax Rules Configuration' },
          { name: 'Health', label: 'System Monitoring' },
          { name: 'Audit', label: 'Audit Trail Logs' }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.name
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS VIEWS */}
      
      {/* 1. MANAGE USERS */}
      {activeTab === 'Users' && (
        <div className="space-y-4">
          {/* User Filter Controls */}
          <div className="bg-white p-4 border border-border shadow-sm rounded-xl flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered accounts..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-slate-50 pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div className="text-xs font-mono text-slate-400 font-medium">
              Registered Accounts: {users.length} profiles
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Filing Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-mono">
                  {filteredUsers.map(u => (
                    <tr key={u.UserID} className="hover:bg-slate-50/50 font-sans">
                      <td className="py-4 px-6 font-mono font-semibold text-slate-500">#{u.UserID}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{u.Name}</td>
                      <td className="py-4 px-6 font-mono text-slate-500">{u.Email}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 px-2 py-0.5 border border-slate-200 rounded text-xs font-medium text-slate-600">
                          {u.Role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.Status === 'Active' 
                            ? 'bg-green-50 text-success border border-green-200' 
                            : 'bg-red-50 text-danger border border-red-200'
                        }`}>
                          {u.Status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center flex items-center justify-center">
                        {u.Status === 'Active' ? (
                          <button
                            onClick={() => handleToggleStatus(u.UserID, u.Status)}
                            className="px-3 py-1.5 border border-red-200 text-danger hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u.UserID, u.Status)}
                            className="px-3 py-1.5 border border-green-200 text-success hover:bg-green-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Activate</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAX RULES CONFIGURATION */}
      {activeTab === 'Rules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddRule}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-95 transition-all flex items-center gap-2 text-xs shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map(rule => (
              <div key={rule.RuleID} className="bg-white p-6 border border-border shadow-sm rounded-xl flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">{rule.RuleName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{rule.Description || 'No description provided.'}</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl font-mono font-bold text-lg flex items-center gap-0.5">
                    <span>{rule.TaxRate}%</span>
                    <Percent className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-3 border-t border-slate-50">
                  <div>Effective: {new Date(rule.EffectiveDate).toLocaleDateString()}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditRule(rule)}
                      className="p-1 text-slate-500 hover:text-primary hover:bg-slate-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.RuleID)}
                      className="p-1 text-slate-500 hover:text-danger hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SYSTEM MONITORING & HEALTH */}
      {activeTab === 'Health' && systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Uptime Card */}
          <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Status</span>
              <div className="p-2 bg-green-50 text-success rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{systemHealth.status}</div>
              <div className="text-xs font-mono text-slate-400 mt-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>System Uptime: {Math.round(systemHealth.uptimeSeconds / 60)} minutes</span>
              </div>
            </div>
          </div>

          {/* CPU Card */}
          <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated CPU Load</span>
              <div className="p-2 bg-blue-50 text-primary rounded-lg">
                <Cpu className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{systemHealth.cpuUsagePct}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border">
                <div className="bg-primary h-full" style={{ width: `${systemHealth.cpuUsagePct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Connector</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Database className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 leading-snug">{systemHealth.database}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(systemHealth.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT TRAIL LOGS */}
      {activeTab === 'Audit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 border border-border shadow-sm rounded-xl flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail logs..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full bg-slate-50 pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div className="text-xs font-mono text-slate-400 font-medium">
              Audit Logs: {filteredLogs.length} events logged
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden p-6 space-y-4 font-mono text-xs max-h-[500px] overflow-y-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(l => (
                <div key={l.LogID} className="flex justify-between items-start border-b border-slate-50 pb-2">
                  <div className="flex items-start gap-4">
                    <span className="text-slate-400 shrink-0 font-bold">[#{l.LogID}]</span>
                    <div>
                      <span className="text-slate-800 font-semibold">{l.Activity}</span>
                      <span className="text-slate-400 text-[10px] block font-sans">Triggered by User ID: #{l.UserID}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-500 font-semibold">{l.IPAddress}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(l.Timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 font-sans font-medium">
                No audit event logs found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE/EDIT TAX RULE DIALOG */}
      {isRuleOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-border rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
              onClick={() => setIsRuleOpen(false)}
            >
              &times;
            </button>

            <h2 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Percent className="h-5.5 w-5.5 text-primary" />
              <span>{editingRuleId ? 'Modify Tax Rate Rule' : 'Configure New Tax Rate Rule'}</span>
            </h2>

            <form onSubmit={handleRuleSubmit} className="space-y-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rule Name / Descriptor</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Freelancer Simplified Tax 2026"
                  className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none"
                  required
                />
              </div>

              {/* Rate & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flat Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ruleRate}
                    onChange={(e) => setRuleRate(e.target.value)}
                    placeholder="0.00"
                    className="h-10 px-4 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none font-mono"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effective From Date</label>
                  <input
                    type="date"
                    value={ruleDate}
                    onChange={(e) => setRuleDate(e.target.value)}
                    className="h-10 px-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rule Description</label>
                <textarea
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="Describe context under which this rate applies..."
                  rows={3}
                  className="p-3 border border-border rounded-lg text-sm bg-slate-50 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRuleOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-sm"
                >
                  {editingRuleId ? 'Save Changes' : 'Create Tax Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
