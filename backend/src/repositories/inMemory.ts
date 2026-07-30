import {
  User,
  Accountant,
  ClientAccount,
  Income,
  ExpenseCategory,
  Expense,
  Receipt,
  OcrMetadata,
  BankStatement,
  BankTransaction,
  AuditRisk,
  TaxRule,
  TaxDeduction,
  TaxCredit,
  TaxReturn,
  FilingHistory,
  Notification,
  AuditLog,
  IUserRepository,
  IAccountantRepository,
  IIncomeRepository,
  IExpenseRepository,
  ITaxRepository,
  INotificationRepository,
   IAuditLogRepository,
  IAutomationRepository
} from './types';

// In-Memory Data Storage
const users: User[] = [];
const accountants: Accountant[] = [];
const clientAccounts: ClientAccount[] = [];
const incomes: Income[] = [];
const categories: ExpenseCategory[] = [];
const expenses: Expense[] = [];
const receipts: Receipt[] = [];
const ocrMetadataList: OcrMetadata[] = [];
const bankStatements: BankStatement[] = [];
const bankTransactions: BankTransaction[] = [];
const auditRisks: AuditRisk[] = [];
const taxRules: TaxRule[] = [];
const taxDeductions: TaxDeduction[] = [];
const taxCredits: TaxCredit[] = [];
const taxReturns: TaxReturn[] = [];
const filingHistories: FilingHistory[] = [];
const notifications: Notification[] = [];
const auditLogs: AuditLog[] = [];

// Seed default data for local testing out of the box
let userAutoId = 1;
let accountantAutoId = 1;
let clientAccountAutoId = 1;
let incomeAutoId = 1;
let categoryAutoId = 1;
let expenseAutoId = 1;
let receiptAutoId = 1;
let ocrAutoId = 1;
let statementAutoId = 1;
let transactionAutoId = 1;
let riskAutoId = 1;
let ruleAutoId = 1;
let deductionAutoId = 1;
let creditAutoId = 1;
let returnAutoId = 1;
let filingAutoId = 1;
let notificationAutoId = 1;
let logAutoId = 1;

// Seed Categories
const defaultCategories = ['Office Supplies', 'Travel & Lodging', 'Meals & Entertainment', 'Rent & Utilities', 'Software & Subscriptions', 'Equipment', 'Advertising & Marketing', 'Other'];
defaultCategories.forEach(name => {
  categories.push({
    CategoryID: categoryAutoId++,
    CategoryName: name,
    Description: `Deductible expenses for ${name.toLowerCase()}`
  });
});

// Seed Tax Rules
taxRules.push({
  RuleID: ruleAutoId++,
  RuleName: 'Standard Individual Tax 2026',
  Description: 'Standard tax rules for individual filing.',
  EffectiveDate: new Date('2026-01-01'),
  TaxRate: 15.0
});
taxRules.push({
  RuleID: ruleAutoId++,
  RuleName: 'Freelancer Simplified Tax 2026',
  Description: 'Flat tax rate for self-employed individuals.',
  EffectiveDate: new Date('2026-01-01'),
  TaxRate: 12.0
});
taxRules.push({
  RuleID: ruleAutoId++,
  RuleName: 'Corporate/Small Business Tax 2026',
  Description: 'Standard corporate tax rate for small businesses.',
  EffectiveDate: new Date('2026-01-01'),
  TaxRate: 20.0
});

// Helper bcrypt mock hashing (bcryptjs is installed, but since this is mock, we can do mock hashing or standard bcryptjs)
import bcrypt from 'bcryptjs';
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

// Seed Users for all 5 roles
const taxpayers = [
  { Name: 'John Doe', Email: 'taxpayer@example.com', Role: 'Individual Taxpayer', PhoneNumber: '555-0101' },
  { Name: 'Freelancer Frank', Email: 'freelancer@example.com', Role: 'Freelancer', PhoneNumber: '555-0102' },
  { Name: 'Biz Owner Betty', Email: 'business@example.com', Role: 'Small Business Owner', PhoneNumber: '555-0103' },
  { Name: 'Accountant Alice', Email: 'accountant@example.com', Role: 'Accountant', PhoneNumber: '555-0104' },
  { Name: 'Admin Andy', Email: 'admin@example.com', Role: 'System Administrator', PhoneNumber: '555-0105' }
];

taxpayers.forEach(t => {
  users.push({
    UserID: userAutoId++,
    Name: t.Name,
    Email: t.Email,
    PasswordHash: defaultPasswordHash,
    PhoneNumber: t.PhoneNumber,
    Role: t.Role,
    Status: 'Active',
    CreatedDate: new Date(),
    LastLogin: null
  });
});

// Seed Accountant Profile for Alice
accountants.push({
  AccountantID: accountantAutoId++,
  Name: 'Accountant Alice',
  Email: 'accountant@example.com',
  PhoneNumber: '555-0104',
  LicenseNumber: 'LIC-2026-98765'
});

// Assign John Doe & Freelancer Frank to Accountant Alice
clientAccounts.push({
  ClientAccountID: clientAccountAutoId++,
  AccountantID: 1,
  UserID: 1, // John Doe
  AssignedDate: new Date()
});
clientAccounts.push({
  ClientAccountID: clientAccountAutoId++,
  AccountantID: 1,
  UserID: 2, // Freelancer Frank
  AssignedDate: new Date()
});

// Seed some starting Transactions for John Doe (UserID 1)
incomes.push({
  IncomeID: incomeAutoId++,
  UserID: 1,
  Source: 'Consulting Contract A',
  Amount: 5000.00,
  IncomeType: 'Freelance',
  Description: 'First milestone payment',
  IncomeDate: new Date('2026-06-15')
});
incomes.push({
  IncomeID: incomeAutoId++,
  UserID: 1,
  Source: 'Monthly Salary',
  Amount: 4200.00,
  IncomeType: 'Salary',
  Description: 'Primary job monthly pay',
  IncomeDate: new Date('2026-07-01')
});

expenses.push({
  ExpenseID: expenseAutoId++,
  UserID: 1,
  CategoryID: 5, // Software
  Amount: 120.00,
  Description: 'Adobe Creative Suite Subscription',
  ExpenseDate: new Date('2026-07-05')
});
expenses.push({
  ExpenseID: expenseAutoId++,
  UserID: 1,
  CategoryID: 1, // Office supplies
  Amount: 45.50,
  Description: 'Office Notebooks & Pens',
  ExpenseDate: new Date('2026-07-06')
});

// Seed some Deductions for John Doe
taxDeductions.push({
  DeductionID: deductionAutoId++,
  UserID: 1,
  DeductionType: 'Education',
  Amount: 800.00,
  Description: 'Student loan interest deduction',
  ApplicableYear: 2026
});

// Seed notifications
notifications.push({
  NotificationID: notificationAutoId++,
  UserID: 1,
  Message: 'Welcome to the Tax Filing Automation Tool! Setup your profile to begin.',
  Type: 'General',
  Status: 'Unread',
  SentDate: new Date()
});

// IMPLEMENTATIONS
export class InMemoryUserRepository implements IUserRepository {
  async create(data: Omit<User, 'UserID' | 'CreatedDate' | 'LastLogin'>): Promise<User> {
    const user: User = {
      UserID: userAutoId++,
      Name: data.Name,
      Email: data.Email,
      PasswordHash: data.PasswordHash,
      PhoneNumber: data.PhoneNumber,
      Role: data.Role,
      Status: data.Status || 'Active',
      CreatedDate: new Date(),
      LastLogin: null
    };
    users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = users.find(u => u.Email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findById(id: number): Promise<User | null> {
    const user = users.find(u => u.UserID === id);
    return user || null;
  }

  async update(id: number, data: Partial<Omit<User, 'UserID'>>): Promise<User> {
    const index = users.findIndex(u => u.UserID === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data };
    return users[index];
  }

  async listAll(): Promise<User[]> {
    return [...users];
  }

  async delete(id: number): Promise<boolean> {
    const index = users.findIndex(u => u.UserID === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }
}

export class InMemoryAccountantRepository implements IAccountantRepository {
  async create(data: Omit<Accountant, 'AccountantID'>): Promise<Accountant> {
    const accountant: Accountant = {
      AccountantID: accountantAutoId++,
      Name: data.Name,
      Email: data.Email,
      PhoneNumber: data.PhoneNumber,
      LicenseNumber: data.LicenseNumber
    };
    accountants.push(accountant);
    return accountant;
  }

  async findByEmail(email: string): Promise<Accountant | null> {
    const index = accountants.find(a => a.Email.toLowerCase() === email.toLowerCase());
    return index || null;
  }

  async findById(id: number): Promise<Accountant | null> {
    const index = accountants.find(a => a.AccountantID === id);
    return index || null;
  }

  async assignClient(accountantId: number, userId: number): Promise<ClientAccount> {
    // Avoid double assignment
    const existing = clientAccounts.find(ca => ca.AccountantID === accountantId && ca.UserID === userId);
    if (existing) return existing;

    const relationship: ClientAccount = {
      ClientAccountID: clientAccountAutoId++,
      AccountantID: accountantId,
      UserID: userId,
      AssignedDate: new Date()
    };
    clientAccounts.push(relationship);
    return relationship;
  }

  async removeClient(accountantId: number, userId: number): Promise<boolean> {
    const index = clientAccounts.findIndex(ca => ca.AccountantID === accountantId && ca.UserID === userId);
    if (index === -1) return false;
    clientAccounts.splice(index, 1);
    return true;
  }

  async listClients(accountantId: number): Promise<User[]> {
    const assignedUserIds = clientAccounts
      .filter(ca => ca.AccountantID === accountantId)
      .map(ca => ca.UserID);
    return users.filter(u => assignedUserIds.includes(u.UserID));
  }

  async listAll(): Promise<Accountant[]> {
    return [...accountants];
  }
}

export class InMemoryIncomeRepository implements IIncomeRepository {
  async create(data: Omit<Income, 'IncomeID'>): Promise<Income> {
    const income: Income = {
      IncomeID: incomeAutoId++,
      UserID: data.UserID,
      Source: data.Source,
      Amount: data.Amount,
      IncomeType: data.IncomeType,
      Description: data.Description,
      IncomeDate: new Date(data.IncomeDate)
    };
    incomes.push(income);
    return income;
  }

  async findById(id: number): Promise<Income | null> {
    const income = incomes.find(i => i.IncomeID === id);
    return income || null;
  }

  async update(id: number, data: Partial<Omit<Income, 'IncomeID'>>): Promise<Income> {
    const index = incomes.findIndex(i => i.IncomeID === id);
    if (index === -1) throw new Error('Income record not found');
    const updated = { ...incomes[index], ...data };
    if (data.IncomeDate) updated.IncomeDate = new Date(data.IncomeDate);
    incomes[index] = updated;
    return incomes[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = incomes.findIndex(i => i.IncomeID === id);
    if (index === -1) return false;
    incomes.splice(index, 1);
    return true;
  }

  async listByUser(userId: number, search?: string, type?: string): Promise<Income[]> {
    let result = incomes.filter(i => i.UserID === userId);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.Source.toLowerCase().includes(q) || (i.Description && i.Description.toLowerCase().includes(q)));
    }
    if (type) {
      result = result.filter(i => i.IncomeType === type);
    }
    return result.sort((a, b) => b.IncomeDate.getTime() - a.IncomeDate.getTime());
  }
}

export class InMemoryExpenseRepository implements IExpenseRepository {
  async createCategory(data: Omit<ExpenseCategory, 'CategoryID'>): Promise<ExpenseCategory> {
    const cat: ExpenseCategory = {
      CategoryID: categoryAutoId++,
      CategoryName: data.CategoryName,
      Description: data.Description
    };
    categories.push(cat);
    return cat;
  }

  async listCategories(): Promise<ExpenseCategory[]> {
    return [...categories];
  }

  async create(data: Omit<Expense, 'ExpenseID' | 'Receipt'>): Promise<Expense> {
    const expense: Expense = {
      ExpenseID: expenseAutoId++,
      UserID: data.UserID,
      CategoryID: data.CategoryID,
      Amount: data.Amount,
      Description: data.Description,
      ExpenseDate: new Date(data.ExpenseDate)
    };
    expenses.push(expense);
    return expense;
  }

  async findById(id: number): Promise<Expense | null> {
    const expense = expenses.find(e => e.ExpenseID === id);
    if (!expense) return null;
    const rct = receipts.find(r => r.ExpenseID === expense.ExpenseID);
    return { ...expense, Receipt: rct || null };
  }

  async update(id: number, data: Partial<Omit<Expense, 'ExpenseID' | 'Receipt'>>): Promise<Expense> {
    const index = expenses.findIndex(e => e.ExpenseID === id);
    if (index === -1) throw new Error('Expense record not found');
    const updated = { ...expenses[index], ...data };
    if (data.ExpenseDate) updated.ExpenseDate = new Date(data.ExpenseDate);
    expenses[index] = updated;
    return expenses[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = expenses.findIndex(e => e.ExpenseID === id);
    if (index === -1) return false;
    expenses.splice(index, 1);
    // Cascade delete receipt
    const rIndex = receipts.findIndex(r => r.ExpenseID === id);
    if (rIndex !== -1) receipts.splice(rIndex, 1);
    return true;
  }

  async listByUser(userId: number, search?: string, categoryId?: number): Promise<Expense[]> {
    let result = expenses.filter(e => e.UserID === userId);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => (e.Description && e.Description.toLowerCase().includes(q)));
    }
    if (categoryId) {
      result = result.filter(e => e.CategoryID === categoryId);
    }
    return result.map(e => {
      const rct = receipts.find(r => r.ExpenseID === e.ExpenseID);
      return { ...e, Receipt: rct || null };
    }).sort((a, b) => b.ExpenseDate.getTime() - a.ExpenseDate.getTime());
  }

  async addReceipt(expenseId: number, fileName: string, filePath: string): Promise<Receipt> {
    const existing = receipts.findIndex(r => r.ExpenseID === expenseId);
    if (existing !== -1) {
      receipts[existing] = {
        ...receipts[existing],
        FileName: fileName,
        FilePath: filePath,
        UploadDate: new Date()
      };
      return receipts[existing];
    }
    const rct: Receipt = {
      ReceiptID: receiptAutoId++,
      ExpenseID: expenseId,
      FileName: fileName,
      FilePath: filePath,
      UploadDate: new Date()
    };
    receipts.push(rct);
    return rct;
  }

  async removeReceipt(expenseId: number): Promise<boolean> {
    const index = receipts.findIndex(r => r.ExpenseID === expenseId);
    if (index === -1) return false;
    receipts.splice(index, 1);
    return true;
  }
}

export class InMemoryTaxRepository implements ITaxRepository {
  // Rules
  async createRule(data: Omit<TaxRule, 'RuleID'>): Promise<TaxRule> {
    const rule: TaxRule = {
      RuleID: ruleAutoId++,
      RuleName: data.RuleName,
      Description: data.Description,
      EffectiveDate: new Date(data.EffectiveDate),
      TaxRate: data.TaxRate
    };
    taxRules.push(rule);
    return rule;
  }

  async listRules(): Promise<TaxRule[]> {
    return [...taxRules];
  }

  async findRuleById(id: number): Promise<TaxRule | null> {
    const rule = taxRules.find(r => r.RuleID === id);
    return rule || null;
  }

  async updateRule(id: number, data: Partial<Omit<TaxRule, 'RuleID'>>): Promise<TaxRule> {
    const index = taxRules.findIndex(r => r.RuleID === id);
    if (index === -1) throw new Error('Tax rule not found');
    const updated = { ...taxRules[index], ...data };
    if (data.EffectiveDate) updated.EffectiveDate = new Date(data.EffectiveDate);
    taxRules[index] = updated;
    return taxRules[index];
  }

  async deleteRule(id: number): Promise<boolean> {
    const index = taxRules.findIndex(r => r.RuleID === id);
    if (index === -1) return false;
    taxRules.splice(index, 1);
    return true;
  }

  // Deductions
  async createDeduction(data: Omit<TaxDeduction, 'DeductionID'>): Promise<TaxDeduction> {
    const ded: TaxDeduction = {
      DeductionID: deductionAutoId++,
      UserID: data.UserID,
      DeductionType: data.DeductionType,
      Amount: data.Amount,
      Description: data.Description,
      ApplicableYear: data.ApplicableYear
    };
    taxDeductions.push(ded);
    return ded;
  }

  async listDeductions(userId: number, year: number): Promise<TaxDeduction[]> {
    return taxDeductions.filter(d => d.UserID === userId && d.ApplicableYear === year);
  }

  async deleteDeduction(id: number): Promise<boolean> {
    const index = taxDeductions.findIndex(d => d.DeductionID === id);
    if (index === -1) return false;
    taxDeductions.splice(index, 1);
    return true;
  }

  // Credits
  async createCredit(data: Omit<TaxCredit, 'CreditID'>): Promise<TaxCredit> {
    const cred: TaxCredit = {
      CreditID: creditAutoId++,
      UserID: data.UserID,
      CreditType: data.CreditType,
      Amount: data.Amount,
      Description: data.Description,
      ApplicableYear: data.ApplicableYear
    };
    taxCredits.push(cred);
    return cred;
  }

  async listCredits(userId: number, year: number): Promise<TaxCredit[]> {
    return taxCredits.filter(c => c.UserID === userId && c.ApplicableYear === year);
  }

  async deleteCredit(id: number): Promise<boolean> {
    const index = taxCredits.findIndex(c => c.CreditID === id);
    if (index === -1) return false;
    taxCredits.splice(index, 1);
    return true;
  }

  // Returns
  async createReturn(data: Omit<TaxReturn, 'ReturnID' | 'SubmissionDate'>): Promise<TaxReturn> {
    // Remove duplicate return for same year if exists
    const duplicateIdx = taxReturns.findIndex(r => r.UserID === data.UserID && r.TaxYear === data.TaxYear);
    if (duplicateIdx !== -1) taxReturns.splice(duplicateIdx, 1);

    const ret: TaxReturn = {
      ReturnID: returnAutoId++,
      UserID: data.UserID,
      RuleID: data.RuleID,
      TaxYear: data.TaxYear,
      TotalIncome: data.TotalIncome,
      TotalExpense: data.TotalExpense,
      TotalDeductions: data.TotalDeductions,
      TaxableIncome: data.TaxableIncome,
      TaxAmount: data.TaxAmount,
      Status: data.Status || 'Pending',
      SubmissionDate: null
    };
    taxReturns.push(ret);

    // log history
    await this.addFilingHistory(ret.ReturnID, 'Created', 'Initial auto-generation.');
    return ret;
  }

  async findReturnById(id: number): Promise<TaxReturn | null> {
    const ret = taxReturns.find(r => r.ReturnID === id);
    return ret || null;
  }

  async listReturnsByUser(userId: number): Promise<TaxReturn[]> {
    return taxReturns.filter(r => r.UserID === userId).sort((a, b) => b.TaxYear - a.TaxYear);
  }

  async updateReturnStatus(id: number, status: string, remarks?: string): Promise<TaxReturn> {
    const index = taxReturns.findIndex(r => r.ReturnID === id);
    if (index === -1) throw new Error('Tax return not found');
    
    taxReturns[index].Status = status;
    if (status === 'Submitted') {
      taxReturns[index].SubmissionDate = new Date();
    }
    
    await this.addFilingHistory(id, status, remarks);
    return taxReturns[index];
  }

  // History
  async listFilingHistory(returnId: number): Promise<FilingHistory[]> {
    return filingHistories.filter(h => h.ReturnID === returnId).sort((a, b) => b.ActionDate.getTime() - a.ActionDate.getTime());
  }

  async addFilingHistory(returnId: number, actionType: string, remarks?: string): Promise<FilingHistory> {
    const hist: FilingHistory = {
      FilingID: filingAutoId++,
      ReturnID: returnId,
      ActionType: actionType,
      ActionDate: new Date(),
      Remarks: remarks || null
    };
    filingHistories.push(hist);
    return hist;
  }
}

export class InMemoryNotificationRepository implements INotificationRepository {
  async create(userId: number, message: string, type: string): Promise<Notification> {
    const notif: Notification = {
      NotificationID: notificationAutoId++,
      UserID: userId,
      Message: message,
      Type: type,
      Status: 'Unread',
      SentDate: new Date()
    };
    notifications.push(notif);
    return notif;
  }

  async listByUser(userId: number): Promise<Notification[]> {
    return notifications.filter(n => n.UserID === userId).sort((a, b) => b.SentDate.getTime() - a.SentDate.getTime());
  }

  async markAsRead(id: number): Promise<Notification> {
    const index = notifications.findIndex(n => n.NotificationID === id);
    if (index === -1) throw new Error('Notification not found');
    notifications[index].Status = 'Read';
    return notifications[index];
  }

  async markAllAsRead(userId: number): Promise<boolean> {
    notifications.forEach((n, idx) => {
      if (n.UserID === userId) {
        notifications[idx].Status = 'Read';
      }
    });
    return true;
  }
}

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  async log(userId: number, activity: string, ipAddress: string): Promise<AuditLog> {
    const entry: AuditLog = {
      LogID: logAutoId++,
      UserID: userId,
      Activity: activity,
      Timestamp: new Date(),
      IPAddress: ipAddress
    };
    auditLogs.push(entry);
    return entry;
  }

  async listAll(): Promise<AuditLog[]> {
    return [...auditLogs].sort((a, b) => b.Timestamp.getTime() - a.Timestamp.getTime());
  }
}

export class InMemoryAutomationRepository implements IAutomationRepository {
  async saveOcrMetadata(data: Omit<OcrMetadata, 'OcrID'>): Promise<OcrMetadata> {
    const item: OcrMetadata = {
      OcrID: ocrAutoId++,
      ...data
    };
    ocrMetadataList.push(item);
    return item;
  }

  async saveBankStatement(
    statementData: Omit<BankStatement, 'StatementID' | 'UploadDate'>,
    transactionsData: Omit<BankTransaction, 'TransactionID' | 'StatementID'>[]
  ): Promise<{ statement: BankStatement; transactions: BankTransaction[] }> {
    const statement: BankStatement = {
      StatementID: statementAutoId++,
      ...statementData,
      UploadDate: new Date()
    };
    bankStatements.push(statement);

    const createdTxns: BankTransaction[] = transactionsData.map(t => {
      const txn: BankTransaction = {
        TransactionID: transactionAutoId++,
        StatementID: statement.StatementID,
        ...t
      };
      bankTransactions.push(txn);
      return txn;
    });

    return { statement, transactions: createdTxns };
  }

  async saveAuditRisk(data: Omit<AuditRisk, 'RiskID' | 'EvaluatedAt'>): Promise<AuditRisk> {
    const record: AuditRisk = {
      RiskID: riskAutoId++,
      ...data,
      EvaluatedAt: new Date()
    };
    auditRisks.push(record);
    return record;
  }

  async getLatestAuditRisk(userId: number): Promise<AuditRisk | null> {
    const userRisks = auditRisks
      .filter(r => r.UserID === userId)
      .sort((a, b) => b.EvaluatedAt.getTime() - a.EvaluatedAt.getTime());
    return userRisks[0] || null;
  }
}
