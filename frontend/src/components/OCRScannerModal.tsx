import React, { useState } from 'react';
import { scanReceiptOCR, type OCRScanResult } from '../services/automationService';

interface OCRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRScanResult | null>(null);
  const [merchantInput, setMerchantInput] = useState('');
  const [amountInput, setAmountInput] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      const res = await scanReceiptOCR(
        selectedFile ? selectedFile.name : 'receipt_sample.png',
        merchantInput || undefined,
        amountInput ? parseFloat(amountInput) : undefined
      );
      setOcrResult(res);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 transition-all">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🧾</span>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Smart OCR Receipt Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Auto-Extract Merchant, Date, Amount & Categorize</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
        </div>

        <div className="mt-4 space-y-4">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-500 rounded-xl p-5 text-center bg-indigo-50/40 dark:bg-slate-800/40 transition">
            {previewUrl ? (
              <div className="relative group">
                <img src={previewUrl} alt="Receipt Preview" className="max-h-48 mx-auto rounded-lg shadow-md object-contain" />
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Image Loaded Ready for OCR Analysis</div>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 mx-auto text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drop your receipt photo or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF receipts up to 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="mt-2 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
          </div>

          {/* Quick manual hints optional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Merchant Hint (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Keells Super"
                value={merchantInput}
                onChange={e => setMerchantInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount LKR (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 2450.00"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* OCR Processing & Results */}
          {scanning && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-center border border-indigo-100 dark:border-indigo-900 animate-pulse">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">🤖 Processing OCR Text Recognition & Classification...</div>
              <p className="text-xs text-indigo-400 dark:text-indigo-500 mt-1">Extracting merchant, total amount, VAT, and expense category...</p>
            </div>
          )}

          {ocrResult && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Extracted OCR Metadata</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Confidence: {ocrResult.ocrData.ConfidenceScore}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div><span className="text-slate-400">Merchant:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrResult.ocrData.ExtractedMerchant}</strong></div>
                <div><span className="text-slate-400">Amount:</span> <strong className="text-emerald-600 dark:text-emerald-400 font-mono">LKR {ocrResult.ocrData.ExtractedAmount.toLocaleString()}</strong></div>
                <div><span className="text-slate-400">Category:</span> <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">{ocrResult.ocrData.AutoCategory}</span></div>
                <div><span className="text-slate-400">Date:</span> <span className="text-slate-700 dark:text-slate-300">{new Date(ocrResult.ocrData.ExtractedDate).toLocaleDateString()}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
          {!ocrResult ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-md transition"
            >
              {scanning ? 'Scanning...' : 'Scan Receipt Photo'}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition"
            >
              Confirm & Save Expense
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
