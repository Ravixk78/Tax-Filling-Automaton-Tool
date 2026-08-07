import React, { useState } from 'react';
import { 
  Bot, 
  Receipt, 
  Landmark, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  FileSpreadsheet,
  Scan,
  Zap
} from 'lucide-react';
import { OCRScannerModal } from '../components/OCRScannerModal';
import { BankStatementIngestModal } from '../components/BankStatementIngestModal';
import { AuditRiskCard } from '../components/AuditRiskCard';

export const AutomationHub: React.FC = () => {
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);

  const handleOcrSuccess = () => {
    setLastActionMsg('Smart OCR scan completed and auto-categorized transaction saved!');
    setTimeout(() => setLastActionMsg(null), 5000);
  };

  const handleBankSuccess = () => {
    setLastActionMsg('Bank statement ingested and transactions synced to tax compute!');
    setTimeout(() => setLastActionMsg(null), 5000);
  };

  return (
    <div className="space-y-8 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-indigo-100 text-indigo-700 tracking-wider">
              Intelligent Automation Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">3 Core Methods Available</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 mt-1">TFAT Automation Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Execute receipt OCR, parse bank statement files (CSV/PDF), and analyze real-time IRD audit risk scores.
          </p>
        </div>
      </div>

      {lastActionMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold animate-fadeIn shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{lastActionMsg}</span>
        </div>
      )}

      {/* Grid of the 3 Automation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Method 1: OCR Scanner */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 hover:shadow-lg transition flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -z-0"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <Receipt className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Method 1
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Smart OCR Receipt Scanner
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Upload image or PDF receipts from your laptop. Auto-extracts merchant names, dates, amounts, VAT, and maps into tax categories.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Optical Character Recognition (OCR)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Auto Expense Classification</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Confidence Score Rating</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 relative z-10">
            <button
              onClick={() => setIsOcrOpen(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <Scan className="h-4 w-4" />
              <span>Launch OCR Receipt Scanner</span>
            </button>
          </div>
        </div>

        {/* Method 2: Bank Statement Ingestion */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-md p-6 hover:shadow-lg transition flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50/50 rounded-bl-full -z-0"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
                <Landmark className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                Method 2
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                Bank Statement Ingestion & Tax Sync
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Import CSV / PDF bank statements (Commercial Bank, Sampath, HNB, BOC, NTB). Extracts line items & calculates live tax liability.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Supports CSV & PDF Statement Formats</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Income / Expense Batch Segregation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Real-Time Tax Computation Sync</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 relative z-10">
            <button
              onClick={() => setIsBankOpen(true)}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Launch Bank Statement Ingest</span>
            </button>
          </div>
        </div>

        {/* Method 3: Audit Risk & IRD Anomaly Detection Engine */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-md p-6 hover:shadow-lg transition flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-bl-full -z-0"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                Method 3
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">
                Automated IRD Rule-Based Audit Risk Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Rule-based automated evaluation of tax filings against Inland Revenue guidelines. Flags unverified transactions, ratio anomalies & high values.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>IRD Anomaly Flag Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Expense-to-Income Ratio Monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Audit Risk Score Index (0-100)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 relative z-10">
            <a
              href="#audit-engine"
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Inspect Live Audit Risk Engine</span>
            </a>
          </div>
        </div>

      </div>

      {/* Interactive Section for Automation Method 3: Audit Risk Engine */}
      <div id="audit-engine" className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-heading font-extrabold text-slate-900">
              Automation Method 3: Audit Risk & Anomaly Analyzer
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Live Backend Evaluator</span>
        </div>

        <AuditRiskCard />
      </div>

      {/* Automation Modals */}
      <OCRScannerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onSuccess={handleOcrSuccess}
      />

      <BankStatementIngestModal
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        onSuccess={handleBankSuccess}
      />

    </div>
  );
};
