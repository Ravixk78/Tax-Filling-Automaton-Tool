import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calculator, 
  FileText, 
  Send, 
  CheckCircle2, 
  FileDown, 
  ArrowRight,
  ArrowLeft,
  Coins,
  Receipt,
  Scale,
  History,
  AlertCircle
} from 'lucide-react';
import { AuditRiskCard } from '../components/AuditRiskCard';

export const TaxReturn: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Data State
  const [incomeSum, setIncomeSum] = useState<number>(0);
  const [expenseSum, setExpenseSum] = useState<number>(0);
  const [deductionsList, setDeductionsList] = useState<any[]>([]);
  const [creditsList, setCreditsList] = useState<any[]>([]);
  const [taxDetails, setTaxDetails] = useState<any>(null);
  
  const [activeReturn, setActiveReturn] = useState<any>(null);
  const [filingHistory, setFilingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchFilingDetails = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch Income sum
      const incRes = await api.get('/income');
      const yearIncomes = incRes.data.incomes.filter((i: any) => new Date(i.IncomeDate).getFullYear() === year);
      setIncomeSum(yearIncomes.reduce((sum: number, item: any) => sum + item.Amount, 0));

      // Fetch Expense sum
      const expRes = await api.get('/expenses');
      const yearExpenses = expRes.data.expenses.filter((e: any) => new Date(e.ExpenseDate).getFullYear() === year);
      setExpenseSum(yearExpenses.reduce((sum: number, item: any) => sum + item.Amount, 0));

      // Fetch Deductions & Credits
      const dedRes = await api.get(`/tax/deductions?year=${year}`);
      setDeductionsList(dedRes.data.deductions);
      const credRes = await api.get(`/tax/credits?year=${year}`);
      setCreditsList(credRes.data.credits);

      // Check if tax return already generated
      const retRes = await api.get(`/tax/returns?userId=${user.UserID}`);
      const returns = retRes.data.taxReturns;
      const currentReturn = returns.find((r: any) => r.TaxYear === year);

      if (currentReturn) {
        setActiveReturn(currentReturn);
        // Load filing history
        const histRes = await api.get(`/tax/returns/${currentReturn.ReturnID}`);
        setFilingHistory(histRes.data.history);
      } else {
        setActiveReturn(null);
        setFilingHistory([]);
      }
    } catch (err) {
      console.error('Failed to load tax filing parameters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilingDetails();
  }, [year]);

  const handleCalculateTax = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tax/calculate?year=${year}`);
      setTaxDetails(res.data.calculation);
      setStep(2); // Advance to rule application and calculation step
    } catch (err) {
      alert('Tax calculation engine failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReturn = async () => {
    try {
      setLoading(true);
      const res = await api.post('/tax/return', { year });
      setActiveReturn(res.data.taxReturn);
      setMessage('Draft tax return generated and stored successfully!');
      
      // Load history
      const histRes = await api.get(`/tax/returns/${res.data.taxReturn.ReturnID}`);
      setFilingHistory(histRes.data.history);
      
      setStep(3); // Advance to preview and submit
    } catch (err) {
      alert('Return generation failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!activeReturn) return;
    try {
      setLoading(true);
      const res = await api.post(`/tax/return/${activeReturn.ReturnID}/submit`);
      setActiveReturn(res.data.taxReturn);
      setMessage('Filing submitted to Tax Authority successfully!');
      
      // Reload history
      const histRes = await api.get(`/tax/returns/${activeReturn.ReturnID}`);
      setFilingHistory(histRes.data.history);
      
      setStep(4); // Filing complete
    } catch (err) {
      alert('Filing submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Print document mock
    window.print();
  };

  const totalDeductions = deductionsList.reduce((sum, d) => sum + d.Amount, 0);
  const totalCredits = creditsList.reduce((sum, c) => sum + c.Amount, 0);

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Tax Return Filing</h1>
        <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
      </div>

      {/* Audit Risk Engine Evaluation Widget */}
      <AuditRiskCard />

      {/* Step Progress Tracker Indicator */}
      <div className="bg-white p-4 border border-border shadow-sm rounded-xl">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 1 ? 'text-slate-700' : 'text-slate-400'}`}>Financials</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-100 mx-4"></div>
          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 2 ? 'text-slate-700' : 'text-slate-400'}`}>Calculate</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-100 mx-4"></div>
          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 3 ? 'text-slate-700' : 'text-slate-400'}`}>Preview & Draft</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-100 mx-4"></div>
          {/* Step 4 */}
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 4 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>4</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 4 ? 'text-slate-700' : 'text-slate-400'}`}>Filing Status</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 text-primary border border-blue-200 px-4 py-3 rounded-lg flex items-center gap-2.5 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* STEP CONTAINER SWITCHER */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Totals */}
            <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Financial Data Summary ({year})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-border rounded-lg flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-primary rounded-full">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Gathered Income</div>
                    <div className="text-xl font-bold text-slate-900">${incomeSum.toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-border rounded-lg flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-danger rounded-full">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Gathered Expenses</div>
                    <div className="text-xl font-bold text-slate-900">${expenseSum.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions & Credits */}
            <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Applicable Deductions & Credits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Claimed Deductions</h4>
                  {deductionsList.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {deductionsList.map((d, index) => (
                        <li key={index} className="flex justify-between border-b border-slate-50 py-1.5 font-mono">
                          <span>{d.DeductionType}</span>
                          <span className="font-semibold text-slate-800">${d.Amount}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No deductions registered. Add standard deductions in settings.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Claimed Credits</h4>
                  {creditsList.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {creditsList.map((c, index) => (
                        <li key={index} className="flex justify-between border-b border-slate-50 py-1.5 font-mono">
                          <span>{c.CreditType}</span>
                          <span className="font-semibold text-slate-800">${c.Amount}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No tax credits registered.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Filing Workflow</h3>
              <p className="text-xs text-slate-500">
                To begin filing, the system will apply specific federal tax rules and calculate your estimated final tax liabilities.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tax Filing Year</label>
                <select 
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="h-10 border border-border rounded-lg px-3 text-sm focus:outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleCalculateTax}
              className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-sm mt-6"
            >
              <span>Calculate Tax Liability</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && taxDetails && (
        <div className="bg-white p-8 border border-border shadow-sm rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span>Federal Tax Calculations Summary ({year})</span>
            </h3>
            <span className="bg-blue-50 text-primary border border-blue-200 px-3 py-1 rounded text-xs font-mono font-bold uppercase">
              Rule Applied: {taxDetails.rule.RuleName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-sm">
            {/* Left detailed breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Formula Breakdown</h4>
              
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span>Total Income (A)</span>
                <span className="font-semibold text-slate-900">${taxDetails.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span>Total Expenses (B)</span>
                <span className="font-semibold text-red-600">-${taxDetails.totalExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span>Total Deductions (C)</span>
                <span className="font-semibold text-red-600">-${taxDetails.totalDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b-2 border-slate-200 py-1.5 bg-slate-50 px-2 rounded">
                <span className="font-semibold">Taxable Income (D = A - B - C)</span>
                <span className="font-bold text-slate-900">${taxDetails.taxableIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span>Tax Rate Applicable</span>
                <span className="font-semibold text-slate-900">{taxDetails.rule.TaxRate}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span>Tax Credits (E)</span>
                <span className="font-semibold text-green-600">-${taxDetails.totalCredits.toLocaleString()}</span>
              </div>
            </div>

            {/* Right estimated card */}
            <div className="bg-slate-950 text-white rounded-xl p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs uppercase text-slate-400 tracking-wider">Estimated Federal Tax Liability</div>
                <div className="text-4xl font-bold font-sans">${taxDetails.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              
              <div className="text-xs text-slate-400 mt-6 leading-relaxed border-t border-slate-800 pt-4">
                This calculation is based on current tax rules configured by the administrator for the {user?.Role} category. Proceeding will save this as a draft return in database registry.
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleGenerateReturn}
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 text-xs shadow-sm"
            >
              <span>Generate Tax Return Draft</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && activeReturn && (
        <div className="bg-white p-8 border border-border shadow-sm rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Preview Tax Return (Year {activeReturn.TaxYear})</h3>
                <span className="text-xs font-mono text-slate-400">Filing ID: {activeReturn.ReturnID}</span>
              </div>
            </div>
            <span className="bg-amber-50 text-warning border border-amber-200 px-3 py-1 rounded text-xs font-bold uppercase">
              Status: {activeReturn.Status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Financial Details */}
            <div className="bg-slate-50 p-6 border border-border rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Summary Table</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span>Gross Income</span>
                  <span className="font-semibold">${Number(activeReturn.TotalIncome).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span>Gross Expenses</span>
                  <span className="font-semibold">${Number(activeReturn.TotalExpense).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span>Total Deductions</span>
                  <span className="font-semibold">${Number(activeReturn.TotalDeductions).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span>Net Taxable Income</span>
                  <span className="font-semibold">${Number(activeReturn.TaxableIncome).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 text-primary font-bold">
                  <span>Tax Payable</span>
                  <span>${Number(activeReturn.TaxAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submission warnings */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex gap-2.5 leading-relaxed">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-bold block mb-1">Declaration and Signature</span>
                  By submitting this return electronically, you declare under penalty of perjury that the financial information registered is accurate and represents all logged accounts.
                </div>
              </div>
              
              <div className="flex justify-between gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 h-11 border border-border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <FileDown className="h-4.5 w-4.5" />
                  <span>Download PDF Preview</span>
                </button>
                
                <button
                  onClick={handleSubmitReturn}
                  className="flex-1 h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-xs shadow-sm"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>Submit Final Return</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && activeReturn && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission complete screen */}
          <div className="lg:col-span-2 bg-white p-8 border border-border shadow-sm rounded-xl text-center flex flex-col items-center justify-center py-12 gap-4">
            <CheckCircle2 className="h-16 w-16 text-success animate-scaleIn" />
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Tax Return Submitted Successfully</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Your return for year {activeReturn.TaxYear} has been stored and queue-forwarded to government compliance authorities.
            </p>
            <div className="border border-border rounded-xl p-4 bg-slate-50 font-mono text-sm w-full max-w-xs mt-4">
              <div className="flex justify-between border-b border-slate-200 py-1.5">
                <span>Tax Year</span>
                <span className="font-semibold">{activeReturn.TaxYear}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1.5">
                <span>Filing Status</span>
                <span className="font-bold text-success uppercase">{activeReturn.Status}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Tax Liability</span>
                <span className="font-bold text-primary">${Number(activeReturn.TaxAmount).toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              className="mt-6 px-6 py-2.5 border border-border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <FileDown className="h-4.5 w-4.5" />
              <span>Download Signed Filing PDF</span>
            </button>
          </div>

          {/* Filing timeline/History */}
          <div className="bg-white p-6 border border-border shadow-sm rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span>Filing History Log</span>
            </h3>
            
            <div className="space-y-4">
              {filingHistory.map((hist, index) => (
                <div key={index} className="flex gap-3 border-l border-slate-100 pl-4 py-1 relative">
                  <span className={`absolute -left-1 top-2 h-2.5 w-2.5 rounded-full ${hist.ActionType === 'Submitted' ? 'bg-success' : 'bg-primary'}`}></span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{hist.ActionType}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{hist.Remarks}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(hist.ActionDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
