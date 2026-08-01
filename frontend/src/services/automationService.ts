import api from './api';

export interface OCRScanResult {
  expense: any;
  receipt: any;
  ocrData: {
    ExtractedMerchant: string;
    ExtractedAmount: number;
    ExtractedDate: string;
    AutoCategory: string;
    ConfidenceScore: number;
    RawText: string;
  };
}

export interface BankIngestResult {
  statement: any;
  transactionsCount: number;
  totalIncomeAdded: number;
  totalExpenseAdded: number;
}

export interface AuditRiskData {
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  scoreValue: number;
  irdComplianceStatus: string;
  anomalyFlags: string[];
  totalIncome: number;
  totalExpense: number;
  expenseRatio: number;
  evaluatedAt: string;
}

export const scanReceiptOCR = async (fileName?: string, customMerchant?: string, customAmount?: number): Promise<OCRScanResult> => {
  const res = await api.post('/automation/ocr-scan', { fileName, customMerchant, customAmount });
  return res.data.data;
};

export const ingestBankStatement = async (fileName?: string, bankName?: string): Promise<BankIngestResult> => {
  const res = await api.post('/automation/bank-ingest', { fileName, bankName });
  return res.data.data;
};

export const getAuditRiskEvaluation = async (userId?: number): Promise<AuditRiskData> => {
  const res = await api.get(userId ? `/automation/audit-risk/${userId}` : '/automation/audit-risk');
  return res.data.data;
};
