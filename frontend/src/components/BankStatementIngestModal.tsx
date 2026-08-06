import React, { useState } from 'react';
import { ingestBankStatement, type BankIngestResult } from '../services/automationService';

interface BankStatementIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BankStatementIngestModal: React.FC<BankStatementIngestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [bankName, setBankName] = useState('Commercial Bank PLC');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BankIngestResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleIngest = async () => {
    try {
      setUploading(true);
      const res = await ingestBankStatement(
        selectedFile ? selectedFile.name : 'bank_statement_2026.csv',
        bankName
      );
      setResult(res);
    } catch (err) {
      console.error('Bank Ingestion Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏦</span>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Automated Bank Statement Ingestion</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">CSV/PDF Parser & Real-time Tax Compute Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Select Bank Institution</label>
            <select
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="Commercial Bank PLC">Commercial Bank PLC</option>
              <option value="Sampath Bank PLC">Sampath Bank PLC</option>
              <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
              <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
              <option value="Nations Trust Bank (NTB)">Nations Trust Bank (NTB)</option>
              <option value="DFCC Bank PLC">DFCC Bank PLC</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-sky-200 dark:border-sky-800/60 hover:border-sky-500 rounded-xl p-5 text-center bg-sky-50/30 dark:bg-slate-800/40">
            <svg className="w-10 h-10 mx-auto text-sky-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedFile ? selectedFile.name : 'Upload Bank Statement (CSV or PDF)'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Automatic Income & Expense Categorization + Tax Computation Sync</p>
            <input type="file" accept=".csv,.pdf" onChange={handleFileChange} className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer" />
          </div>

          {uploading && (
            <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-center border border-sky-100 dark:border-sky-900 animate-pulse">
              <div className="text-sky-600 dark:text-sky-400 font-bold text-sm">⚡ Parsing Bank Transactions & Calculating Tax...</div>
              <p className="text-xs text-sky-400 dark:text-sky-500 mt-1">Extracting credit & debit entries, segregating taxes...</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <span>✓</span>
                <span>Bank Statement Ingested & Tax Compute Synced!</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Income Transactions Added</span>
                  <strong className="text-emerald-600 text-sm font-mono">+LKR {result.totalIncomeAdded.toLocaleString()}</strong>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Expense Transactions Added</span>
                  <strong className="text-rose-500 text-sm font-mono">-LKR {result.totalExpenseAdded.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
          {!result ? (
            <button
              onClick={handleIngest}
              disabled={uploading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-md transition"
            >
              {uploading ? 'Ingesting...' : 'Ingest & Compute Tax'}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition"
            >
              Done & View Records
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
