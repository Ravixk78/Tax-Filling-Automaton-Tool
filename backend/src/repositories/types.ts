export interface User {
  UserID: number;
  Name: string;
  Email: string;
  PasswordHash: string;
  PhoneNumber: string;
  Role: string;
  Status: string;
  CreatedDate: Date;
  LastLogin: Date | null;
}

export interface Accountant {
  AccountantID: number;
  Name: string;
  Email: string;
  PhoneNumber: string;
  LicenseNumber: string;
}

export interface ClientAccount {
  ClientAccountID: number;
  AccountantID: number;
  UserID: number;
  AssignedDate: Date;
}

export interface Income {
  IncomeID: number;
  UserID: number;
  Source: string;
  Amount: number;
  IncomeType: string;
  Description: string | null;
  IncomeDate: Date;
}

export interface ExpenseCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string | null;
}

export interface Expense {
  ExpenseID: number;
  UserID: number;
  CategoryID: number;
  Amount: number;
  Description: string | null;
  ExpenseDate: Date;
  Receipt?: Receipt | null;
}

export interface Receipt {
  ReceiptID: number;
  ExpenseID: number;
  FileName: string;
  FilePath: string;
  UploadDate: Date;
}

export interface TaxRule {
  RuleID: number;
  RuleName: string;
  Description: string | null;
  EffectiveDate: Date;
  TaxRate: number;
}

export interface TaxDeduction {
  DeductionID: number;
  UserID: number;
  DeductionType: string;
  Amount: number;
  Description: string | null;
  ApplicableYear: number;
}

export interface TaxCredit {
  CreditID: number;
  UserID: number;
  CreditType: string;
  Amount: number;
  Description: string | null;
  ApplicableYear: number;
}

export interface TaxReturn {
  ReturnID: number;
  UserID: number;
  RuleID: number;
  TaxYear: number;
  TotalIncome: number;
  TotalExpense: number;
  TotalDeductions: number;
  TaxableIncome: number;
  TaxAmount: number;
  Status: string;
  SubmissionDate: Date | null;
}

export interface FilingHistory {
  FilingID: number;
  ReturnID: number;
  ActionType: string;
  ActionDate: Date;
  Remarks: string | null;
}

export interface Notification {
  NotificationID: number;
  UserID: number;
  Message: string;
  Type: string;
  Status: string;
  SentDate: Date;
}

export interface AuditLog {
  LogID: number;
  UserID: number;
  Activity: string;
  Timestamp: Date;
  IPAddress: string;
}

export interface OcrMetadata {
  OcrID: number;
  ReceiptID: number;
  ExtractedMerchant: string | null;
  ExtractedAmount: number | null;
  ExtractedDate: Date | null;
  AutoCategory: string | null;
  ConfidenceScore: number | null;
  RawText: string | null;
}

export interface BankStatement {
  StatementID: number;
  UserID: number;
  FileName: string;
  BankName: string | null;
  UploadDate: Date;
  TotalTransactions: number;
}

export interface BankTransaction {
  TransactionID: number;
  StatementID: number;
  TransactionDate: Date;
  Description: string;
  Amount: number;
  Type: 'INCOME' | 'EXPENSE';
  Category?: string | null;
  SyncStatus: string;
}

export interface AuditRisk {
  RiskID: number;
  UserID: number;
  ReturnID: number | null;
  RiskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  ScoreValue: number;
  AnomalyFlags: string[];
  IRDComplianceStatus: string;
  EvaluatedAt: Date;
}

export interface IAutomationRepository {
  saveOcrMetadata(data: Omit<OcrMetadata, 'OcrID'>): Promise<OcrMetadata>;
  saveBankStatement(statement: Omit<BankStatement, 'StatementID' | 'UploadDate'>, transactions: Omit<BankTransaction, 'TransactionID' | 'StatementID'>[]): Promise<{ statement: BankStatement; transactions: BankTransaction[] }>;
  saveAuditRisk(data: Omit<AuditRisk, 'RiskID' | 'EvaluatedAt'>): Promise<AuditRisk>;
  getLatestAuditRisk(userId: number): Promise<AuditRisk | null>;
}

export interface IUserRepository {
  create(data: Omit<User, 'UserID' | 'CreatedDate' | 'LastLogin'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  update(id: number, data: Partial<Omit<User, 'UserID'>>): Promise<User>;
  listAll(): Promise<User[]>;
  delete(id: number): Promise<boolean>;
}

export interface IAccountantRepository {
  create(data: Omit<Accountant, 'AccountantID'>): Promise<Accountant>;
  findByEmail(email: string): Promise<Accountant | null>;
  findById(id: number): Promise<Accountant | null>;
  assignClient(accountantId: number, userId: number): Promise<ClientAccount>;
  removeClient(accountantId: number, userId: number): Promise<boolean>;
  listClients(accountantId: number): Promise<User[]>;
  listAll(): Promise<Accountant[]>;
}

export interface IIncomeRepository {
  create(data: Omit<Income, 'IncomeID'>): Promise<Income>;
  findById(id: number): Promise<Income | null>;
  update(id: number, data: Partial<Omit<Income, 'IncomeID'>>): Promise<Income>;
  delete(id: number): Promise<boolean>;
  listByUser(userId: number, search?: string, type?: string): Promise<Income[]>;
}

 export interface IExpenseRepository {
  createCategory(data: Omit<ExpenseCategory, 'CategoryID'>): Promise<ExpenseCategory>;
  listCategories(): Promise<ExpenseCategory[]>;
  create(data: Omit<Expense, 'ExpenseID' | 'Receipt'>): Promise<Expense>;
  findById(id: number): Promise<Expense | null>;
  update(id: number, data: Partial<Omit<Expense, 'ExpenseID' | 'Receipt'>>): Promise<Expense>;
  delete(id: number): Promise<boolean>;
  listByUser(userId: number, search?: string, categoryId?: number): Promise<Expense[]>;
  addReceipt(expenseId: number, fileName: string, filePath: string): Promise<Receipt>;
  removeReceipt(expenseId: number): Promise<boolean>;
}

export interface ITaxRepository {
  // Rules
  createRule(data: Omit<TaxRule, 'RuleID'>): Promise<TaxRule>;
  listRules(): Promise<TaxRule[]>;
  findRuleById(id: number): Promise<TaxRule | null>;
  updateRule(id: number, data: Partial<Omit<TaxRule, 'RuleID'>>): Promise<TaxRule>;
  deleteRule(id: number): Promise<boolean>;

  // Deductions
  createDeduction(data: Omit<TaxDeduction, 'DeductionID'>): Promise<TaxDeduction>;
  listDeductions(userId: number, year: number): Promise<TaxDeduction[]>;
  deleteDeduction(id: number): Promise<boolean>;

  // Credits
  createCredit(data: Omit<TaxCredit, 'CreditID'>): Promise<TaxCredit>;
  listCredits(userId: number, year: number): Promise<TaxCredit[]>;
  deleteCredit(id: number): Promise<boolean>;

  // Returns
  createReturn(data: Omit<TaxReturn, 'ReturnID' | 'SubmissionDate'>): Promise<TaxReturn>;
  findReturnById(id: number): Promise<TaxReturn | null>;
  listReturnsByUser(userId: number): Promise<TaxReturn[]>;
  updateReturnStatus(id: number, status: string, remarks?: string): Promise<TaxReturn>;
  
  // History
  listFilingHistory(returnId: number): Promise<FilingHistory[]>;
  addFilingHistory(returnId: number, actionType: string, remarks?: string): Promise<FilingHistory>;
}

export interface INotificationRepository {
  create(userId: number, message: string, type: string): Promise<Notification>;
  listByUser(userId: number): Promise<Notification[]>;
  markAsRead(id: number): Promise<Notification>;
  markAllAsRead(userId: number): Promise<boolean>;
}

export interface IAuditLogRepository {
  log(userId: number, activity: string, ipAddress: string): Promise<AuditLog>;
  listAll(): Promise<AuditLog[]>;
}
