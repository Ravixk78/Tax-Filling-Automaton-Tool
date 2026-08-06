import { Response } from 'express';
import { taxRepository, incomeRepository, expenseRepository, notificationRepository } from '../repositories';
import { logActivity } from '../helpers/auditLogger';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to compute tax metrics
async function performTaxCalculation(userId: number, role: string, year: number) {
  // 1. Retrieve Income records
  const userIncomes = await incomeRepository.listByUser(userId);
  // Filter for matching year
  const yearIncomes = userIncomes.filter(i => new Date(i.IncomeDate).getFullYear() === year);
  const totalIncome = yearIncomes.reduce((sum, item) => sum + item.Amount, 0);

  // 2. Retrieve Expense records
  const userExpenses = await expenseRepository.listByUser(userId);
  const yearExpenses = userExpenses.filter(e => new Date(e.ExpenseDate).getFullYear() === year);
  const totalExpense = yearExpenses.reduce((sum, item) => sum + item.Amount, 0);

  // 3. Retrieve Deductions & Credits
  const deductions = await taxRepository.listDeductions(userId, year);
  const credits = await taxRepository.listCredits(userId, year);

  const totalDeductions = deductions.reduce((sum, d) => sum + d.Amount, 0);
  const totalCredits = credits.reduce((sum, c) => sum + c.Amount, 0);

  // 4. Apply Tax Rules based on Role
  const rules = await taxRepository.listRules();
  let selectedRule = rules[0]; // fallback default
  
  if (role === 'Freelancer') {
    selectedRule = rules.find(r => r.RuleName.includes('Freelancer')) || selectedRule;
  } else if (role === 'Small Business Owner') {
    selectedRule = rules.find(r => r.RuleName.includes('Business')) || selectedRule;
  } else {
    selectedRule = rules.find(r => r.RuleName.includes('Individual')) || selectedRule;
  }

  // Calculate taxable income
  // TaxableIncome = TotalIncome - TotalExpense - TotalDeductions
  let taxableIncome = totalIncome - totalExpense - totalDeductions;
  if (taxableIncome < 0) taxableIncome = 0;

  // Calculate tax amount
  // TaxAmount = (TaxableIncome * Rate) - Credits
  let taxAmount = (taxableIncome * selectedRule.TaxRate) / 100 - totalCredits;
  if (taxAmount < 0) taxAmount = 0;

  return {
    totalIncome,
    totalExpense,
    totalDeductions,
    totalCredits,
    taxableIncome,
    taxAmount,
    rule: selectedRule
  };
}

export async function calculateTax(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const year = req.query.year ? parseInt(String(req.query.year)) : new Date().getFullYear();

    const calculation = await performTaxCalculation(req.user.UserID, req.user.Role, year);
    res.status(200).json({ year, calculation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function generateTaxReturn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const year = req.body.year ? parseInt(req.body.year) : new Date().getFullYear();

    const calculation = await performTaxCalculation(req.user.UserID, req.user.Role, year);

    const taxReturn = await taxRepository.createReturn({
      UserID: req.user.UserID,
      RuleID: calculation.rule.RuleID,
      TaxYear: year,
      TotalIncome: calculation.totalIncome,
      TotalExpense: calculation.totalExpense,
      TotalDeductions: calculation.totalDeductions,
      TaxableIncome: calculation.taxableIncome,
      TaxAmount: calculation.taxAmount,
      Status: 'Pending'
    });

    await logActivity(req.user.UserID, `Generated tax return for year ${year}. Est. Tax: $${calculation.taxAmount.toFixed(2)}`, req.ip);
    await notificationRepository.create(req.user.UserID, `Your tax return draft for ${year} was generated successfully.`, 'FilingStatus');

    res.status(201).json({ message: 'Tax return successfully generated', taxReturn });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function submitTaxReturn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Return ID' });

    const taxReturn = await taxRepository.findReturnById(id);
    if (!taxReturn || (taxReturn.UserID !== req.user.UserID && req.user.Role !== 'Accountant')) {
      return res.status(404).json({ error: 'Tax return not found' });
    }

    // Submit tax return
    const updated = await taxRepository.updateReturnStatus(id, 'Submitted', `Filing submitted electronically by ${req.user.Role === 'Accountant' ? 'Accountant on behalf of client' : 'Taxpayer'}.`);

    await logActivity(taxReturn.UserID, `Submitted tax return for year ${taxReturn.TaxYear}. Status: Submitted`, req.ip);
    await notificationRepository.create(taxReturn.UserID, `Your tax return for ${taxReturn.TaxYear} has been submitted successfully.`, 'FilingStatus');

    res.status(200).json({ message: 'Tax return successfully submitted', taxReturn: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listReturns(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Users see their own returns, Accountants see clients, Admins see all
    let userId = req.user.UserID;
    if (req.query.userId && (req.user.Role === 'Accountant' || req.user.Role === 'System Administrator')) {
      userId = parseInt(String(req.query.userId));
    }

    const list = await taxRepository.listReturnsByUser(userId);
    res.status(200).json({ taxReturns: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getReturnById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Return ID' });

    const taxReturn = await taxRepository.findReturnById(id);
    if (!taxReturn) return res.status(404).json({ error: 'Tax return not found' });

    // Access check
    if (taxReturn.UserID !== req.user.UserID && req.user.Role !== 'Accountant' && req.user.Role !== 'System Administrator') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const history = await taxRepository.listFilingHistory(id);

    res.status(200).json({ taxReturn, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Deductions CRUD
export async function addDeduction(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { DeductionType, Amount, Description, ApplicableYear } = req.body;

    if (!DeductionType || Amount === undefined || !ApplicableYear) {
      return res.status(400).json({ error: 'DeductionType, Amount, and ApplicableYear are required' });
    }

    const amt = parseFloat(Amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });

    const deduction = await taxRepository.createDeduction({
      UserID: req.user.UserID,
      DeductionType,
      Amount: amt,
      Description: Description || null,
      ApplicableYear: parseInt(ApplicableYear)
    });

    res.status(201).json({ message: 'Deduction recorded successfully', deduction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listDeductions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const year = req.query.year ? parseInt(String(req.query.year)) : new Date().getFullYear();

    const list = await taxRepository.listDeductions(req.user.UserID, year);
    res.status(200).json({ deductions: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteDeduction(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const deleted = await taxRepository.deleteDeduction(id);
    if (deleted) {
      res.status(200).json({ message: 'Deduction successfully deleted' });
    } else {
      res.status(404).json({ error: 'Deduction not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Credits CRUD
export async function addCredit(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { CreditType, Amount, Description, ApplicableYear } = req.body;

    if (!CreditType || Amount === undefined || !ApplicableYear) {
      return res.status(400).json({ error: 'CreditType, Amount, and ApplicableYear are required' });
    }

    const amt = parseFloat(Amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });

    const credit = await taxRepository.createCredit({
      UserID: req.user.UserID,
      CreditType,
      Amount: amt,
      Description: Description || null,
      ApplicableYear: parseInt(ApplicableYear)
    });

    res.status(201).json({ message: 'Tax credit recorded successfully', credit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listCredits(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const year = req.query.year ? parseInt(String(req.query.year)) : new Date().getFullYear();

    const list = await taxRepository.listCredits(req.user.UserID, year);
    res.status(200).json({ credits: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCredit(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const deleted = await taxRepository.deleteCredit(id);
    if (deleted) {
      res.status(200).json({ message: 'Tax credit successfully deleted' });
    } else {
      res.status(404).json({ error: 'Tax credit not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
