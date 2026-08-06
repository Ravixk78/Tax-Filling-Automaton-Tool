import { prisma } from '../db';
import { Prisma } from '@prisma/client';
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

// Prisma Mapper Helpers
function mapUser(u: any): User {
  return {
    UserID: u.UserID,
    Name: u.Name,
    Email: u.Email,
    PasswordHash: u.PasswordHash,
    PhoneNumber: u.PhoneNumber,
    Role: u.Role,
    Status: u.Status,
    CreatedDate: u.CreatedDate,
    LastLogin: u.LastLogin
  };
}

function mapAccountant(a: any): Accountant {
  return {
    AccountantID: a.AccountantID,
    Name: a.Name,
    Email: a.Email,
    PhoneNumber: a.PhoneNumber,
    LicenseNumber: a.LicenseNumber
  };
}

function mapIncome(i: any): Income {
  return {
    IncomeID: i.IncomeID,
    UserID: i.UserID,
    Source: i.Source,
    Amount: Number(i.Amount),
    IncomeType: i.IncomeType,
    Description: i.Description,
    IncomeDate: i.IncomeDate
  };
}

function mapExpense(e: any): Expense {
  return {
    ExpenseID: e.ExpenseID,
    UserID: e.UserID,
    CategoryID: e.CategoryID,
    Amount: Number(e.Amount),
    Description: e.Description,
    ExpenseDate: e.ExpenseDate,
    Receipt: e.Receipt ? {
      ReceiptID: e.Receipt.ReceiptID,
      ExpenseID: e.Receipt.ExpenseID,
      FileName: e.Receipt.FileName,
      FilePath: e.Receipt.FilePath,
      UploadDate: e.Receipt.UploadDate
    } : null
  };
}

function mapTaxRule(r: any): TaxRule {
  return {
    RuleID: r.RuleID,
    RuleName: r.RuleName,
    Description: r.Description,
    EffectiveDate: r.EffectiveDate,
    TaxRate: Number(r.TaxRate)
  };
}

function mapTaxDeduction(d: any): TaxDeduction {
  return {
    DeductionID: d.DeductionID,
    UserID: d.UserID,
    DeductionType: d.DeductionType,
    Amount: Number(d.Amount),
    Description: d.Description,
    ApplicableYear: d.ApplicableYear
  };
}

function mapTaxCredit(c: any): TaxCredit {
  return {
    CreditID: c.CreditID,
    UserID: c.UserID,
    CreditType: c.CreditType,
    Amount: Number(c.Amount),
    Description: c.Description,
    ApplicableYear: c.ApplicableYear
  };
}

function mapTaxReturn(tr: any): TaxReturn {
  return {
    ReturnID: tr.ReturnID,
    UserID: tr.UserID,
    RuleID: tr.RuleID,
    TaxYear: tr.TaxYear,
    TotalIncome: Number(tr.TotalIncome),
    TotalExpense: Number(tr.TotalExpense),
    TotalDeductions: Number(tr.TotalDeductions),
    TaxableIncome: Number(tr.TaxableIncome),
    TaxAmount: Number(tr.TaxAmount),
    Status: tr.Status,
    SubmissionDate: tr.SubmissionDate
  };
}

export class PrismaUserRepository implements IUserRepository {
  async create(data: Omit<User, 'UserID' | 'CreatedDate' | 'LastLogin'>): Promise<User> {
    const res = await prisma.user.create({
      data: {
        Name: data.Name,
        Email: data.Email,
        PasswordHash: data.PasswordHash,
        PhoneNumber: data.PhoneNumber,
        Role: data.Role,
        Status: data.Status
      }
    });
    return mapUser(res);
  }

  async findByEmail(email: string): Promise<User | null> {
    const res = await prisma.user.findUnique({ where: { Email: email } });
    return res ? mapUser(res) : null;
  }

  async findById(id: number): Promise<User | null> {
    const res = await prisma.user.findUnique({ where: { UserID: id } });
    return res ? mapUser(res) : null;
  }

  async update(id: number, data: Partial<Omit<User, 'UserID'>>): Promise<User> {
    const res = await prisma.user.update({
      where: { UserID: id },
      data: data as any
    });
    return mapUser(res);
  }

  async listAll(): Promise<User[]> {
    const list = await prisma.user.findMany();
    return list.map(mapUser);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { UserID: id } });
      return true;
    } catch {
      return false;
    }
  }
}

export class PrismaAccountantRepository implements IAccountantRepository {
  async create(data: Omit<Accountant, 'AccountantID'>): Promise<Accountant> {
    const res = await prisma.accountant.create({
      data: {
        Name: data.Name,
        Email: data.Email,
        PhoneNumber: data.PhoneNumber,
        LicenseNumber: data.LicenseNumber
      }
    });
    return mapAccountant(res);
  }

  async findByEmail(email: string): Promise<Accountant | null> {
    const res = await prisma.accountant.findUnique({ where: { Email: email } });
    return res ? mapAccountant(res) : null;
  }

  async findById(id: number): Promise<Accountant | null> {
    const res = await prisma.accountant.findUnique({ where: { AccountantID: id } });
    return res ? mapAccountant(res) : null;
  }

  async assignClient(accountantId: number, userId: number): Promise<ClientAccount> {
    const res = await prisma.clientAccount.create({
      data: {
        AccountantID: accountantId,
        UserID: userId
      }
    });
    return {
      ClientAccountID: res.ClientAccountID,
      AccountantID: res.AccountantID,
      UserID: res.UserID,
      AssignedDate: res.AssignedDate
    };
  }

  async removeClient(accountantId: number, userId: number): Promise<boolean> {
    try {
      const match = await prisma.clientAccount.findFirst({
        where: { AccountantID: accountantId, UserID: userId }
      });
      if (!match) return false;
      await prisma.clientAccount.delete({ where: { ClientAccountID: match.ClientAccountID } });
      return true;
    } catch {
      return false;
    }
  }

  async listClients(accountantId: number): Promise<User[]> {
    const list = await prisma.clientAccount.findMany({
      where: { AccountantID: accountantId },
      include: { User: true }
    });
    return list.map(item => mapUser(item.User));
  }

  async listAll(): Promise<Accountant[]> {
    const list = await prisma.accountant.findMany();
    return list.map(mapAccountant);
  }
}

export class PrismaIncomeRepository implements IIncomeRepository {
  async create(data: Omit<Income, 'IncomeID'>): Promise<Income> {
    const res = await prisma.income.create({
      data: {
        UserID: data.UserID,
        Source: data.Source,
        Amount: new Prisma.Decimal(data.Amount),
        IncomeType: data.IncomeType,
        Description: data.Description,
        IncomeDate: new Date(data.IncomeDate)
      }
    });
    return mapIncome(res);
  }

  async findById(id: number): Promise<Income | null> {
    const res = await prisma.income.findUnique({ where: { IncomeID: id } });
    return res ? mapIncome(res) : null;
  }

  async update(id: number, data: Partial<Omit<Income, 'IncomeID'>>): Promise<Income> {
    const updatedData: any = { ...data };
    if (data.Amount !== undefined) updatedData.Amount = new Prisma.Decimal(data.Amount);
    if (data.IncomeDate !== undefined) updatedData.IncomeDate = new Date(data.IncomeDate);
    const res = await prisma.income.update({
      where: { IncomeID: id },
      data: updatedData
    });
    return mapIncome(res);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.income.delete({ where: { IncomeID: id } });
      return true;
    } catch {
      return false;
    }
  }

  async listByUser(userId: number, search?: string, type?: string): Promise<Income[]> {
    const filters: any = { UserID: userId };
    if (search) {
      filters.OR = [
        { Source: { contains: search, mode: 'insensitive' } },
        { Description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (type) {
      filters.IncomeType = type;
    }
    const list = await prisma.income.findMany({
      where: filters,
      orderBy: { IncomeDate: 'desc' }
    });
    return list.map(mapIncome);
  }
}

export class PrismaExpenseRepository implements IExpenseRepository {
  async createCategory(data: Omit<ExpenseCategory, 'CategoryID'>): Promise<ExpenseCategory> {
    const res = await prisma.expenseCategory.create({
      data: {
        CategoryName: data.CategoryName,
        Description: data.Description
      }
    });
    return {
      CategoryID: res.CategoryID,
      CategoryName: res.CategoryName,
      Description: res.Description
    };
  }

  async listCategories(): Promise<ExpenseCategory[]> {
    const list = await prisma.expenseCategory.findMany();
    return list.map(res => ({
      CategoryID: res.CategoryID,
      CategoryName: res.CategoryName,
      Description: res.Description
    }));
  }

  async create(data: Omit<Expense, 'ExpenseID' | 'Receipt'>): Promise<Expense> {
    const res = await prisma.expense.create({
      data: {
        UserID: data.UserID,
        CategoryID: data.CategoryID,
        Amount: new Prisma.Decimal(data.Amount),
        Description: data.Description,
        ExpenseDate: new Date(data.ExpenseDate)
      }
    });
    return mapExpense(res);
  }

  async findById(id: number): Promise<Expense | null> {
    const res = await prisma.expense.findUnique({
      where: { ExpenseID: id },
      include: { Receipt: true }
    });
    return res ? mapExpense(res) : null;
  }

  async update(id: number, data: Partial<Omit<Expense, 'ExpenseID' | 'Receipt'>>): Promise<Expense> {
    const updatedData: any = { ...data };
    if (data.Amount !== undefined) updatedData.Amount = new Prisma.Decimal(data.Amount);
    if (data.ExpenseDate !== undefined) updatedData.ExpenseDate = new Date(data.ExpenseDate);
    const res = await prisma.expense.update({
      where: { ExpenseID: id },
      data: updatedData,
      include: { Receipt: true }
    });
    return mapExpense(res);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.expense.delete({ where: { ExpenseID: id } });
      return true;
    } catch {
      return false;
    }
  }

  async listByUser(userId: number, search?: string, categoryId?: number): Promise<Expense[]> {
    const filters: any = { UserID: userId };
    if (search) {
      filters.Description = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      filters.CategoryID = categoryId;
    }
    const list = await prisma.expense.findMany({
      where: filters,
      include: { Receipt: true },
      orderBy: { ExpenseDate: 'desc' }
    });
    return list.map(mapExpense);
  }

  async addReceipt(expenseId: number, fileName: string, filePath: string): Promise<Receipt> {
    const res = await prisma.receipt.upsert({
      where: { ExpenseID: expenseId },
      update: { FileName: fileName, FilePath: filePath, UploadDate: new Date() },
      create: { ExpenseID: expenseId, FileName: fileName, FilePath: filePath }
    });
    return {
      ReceiptID: res.ReceiptID,
      ExpenseID: res.ExpenseID,
      FileName: res.FileName,
      FilePath: res.FilePath,
      UploadDate: res.UploadDate
    };
  }

  async removeReceipt(expenseId: number): Promise<boolean> {
    try {
      await prisma.receipt.delete({ where: { ExpenseID: expenseId } });
      return true;
    } catch {
      return false;
    }
  }
}

export class PrismaTaxRepository implements ITaxRepository {
  // Rules
  async createRule(data: Omit<TaxRule, 'RuleID'>): Promise<TaxRule> {
    const res = await prisma.taxRule.create({
      data: {
        RuleName: data.RuleName,
        Description: data.Description,
        EffectiveDate: new Date(data.EffectiveDate),
        TaxRate: new Prisma.Decimal(data.TaxRate)
      }
    });
    return mapTaxRule(res);
  }

  async listRules(): Promise<TaxRule[]> {
    const list = await prisma.taxRule.findMany();
    return list.map(mapTaxRule);
  }

  async findRuleById(id: number): Promise<TaxRule | null> {
    const res = await prisma.taxRule.findUnique({ where: { RuleID: id } });
    return res ? mapTaxRule(res) : null;
  }

  async updateRule(id: number, data: Partial<Omit<TaxRule, 'RuleID'>>): Promise<TaxRule> {
    const updatedData: any = { ...data };
    if (data.TaxRate !== undefined) updatedData.TaxRate = new Prisma.Decimal(data.TaxRate);
    if (data.EffectiveDate !== undefined) updatedData.EffectiveDate = new Date(data.EffectiveDate);
    const res = await prisma.taxRule.update({
      where: { RuleID: id },
      data: updatedData
    });
    return mapTaxRule(res);
  }

  async deleteRule(id: number): Promise<boolean> {
    try {
      await prisma.taxRule.delete({ where: { RuleID: id } });
      return true;
    } catch {
      return false;
    }
  }

  // Deductions
  async createDeduction(data: Omit<TaxDeduction, 'DeductionID'>): Promise<TaxDeduction> {
    const res = await prisma.taxDeduction.create({
      data: {
        UserID: data.UserID,
        DeductionType: data.DeductionType,
        Amount: new Prisma.Decimal(data.Amount),
        Description: data.Description,
        ApplicableYear: data.ApplicableYear
      }
    });
    return mapTaxDeduction(res);
  }

  async listDeductions(userId: number, year: number): Promise<TaxDeduction[]> {
    const list = await prisma.taxDeduction.findMany({
      where: { UserID: userId, ApplicableYear: year }
    });
    return list.map(mapTaxDeduction);
  }

  async deleteDeduction(id: number): Promise<boolean> {
    try {
      await prisma.taxDeduction.delete({ where: { DeductionID: id } });
      return true;
    } catch {
      return false;
    }
  }

  // Credits
  async createCredit(data: Omit<TaxCredit, 'CreditID'>): Promise<TaxCredit> {
    const res = await prisma.taxCredit.create({
      data: {
        UserID: data.UserID,
        CreditType: data.CreditType,
        Amount: new Prisma.Decimal(data.Amount),
        Description: data.Description,
        ApplicableYear: data.ApplicableYear
      }
    });
    return mapTaxCredit(res);
  }

  async listCredits(userId: number, year: number): Promise<TaxCredit[]> {
    const list = await prisma.taxCredit.findMany({
      where: { UserID: userId, ApplicableYear: year }
    });
    return list.map(mapTaxCredit);
  }

  async deleteCredit(id: number): Promise<boolean> {
    try {
      await prisma.taxCredit.delete({ where: { CreditID: id } });
      return true;
    } catch {
      return false;
    }
  }

  // Returns
  async createReturn(data: Omit<TaxReturn, 'ReturnID' | 'SubmissionDate'>): Promise<TaxReturn> {
    // Delete duplicate return for same year if exists
    try {
      await prisma.taxReturn.deleteMany({
        where: { UserID: data.UserID, TaxYear: data.TaxYear }
      });
    } catch {}

    const res = await prisma.taxReturn.create({
      data: {
        UserID: data.UserID,
        RuleID: data.RuleID,
        TaxYear: data.TaxYear,
        TotalIncome: new Prisma.Decimal(data.TotalIncome),
        TotalExpense: new Prisma.Decimal(data.TotalExpense),
        TotalDeductions: new Prisma.Decimal(data.TotalDeductions),
        TaxableIncome: new Prisma.Decimal(data.TaxableIncome),
        TaxAmount: new Prisma.Decimal(data.TaxAmount),
        Status: data.Status
      }
    });
    
    await this.addFilingHistory(res.ReturnID, 'Created', 'Initial auto-generation.');
    return mapTaxReturn(res);
  }

  async findReturnById(id: number): Promise<TaxReturn | null> {
    const res = await prisma.taxReturn.findUnique({ where: { ReturnID: id } });
    return res ? mapTaxReturn(res) : null;
  }

  async listReturnsByUser(userId: number): Promise<TaxReturn[]> {
    const list = await prisma.taxReturn.findMany({
      where: { UserID: userId },
      orderBy: { TaxYear: 'desc' }
    });
    return list.map(mapTaxReturn);
  }

  async updateReturnStatus(id: number, status: string, remarks?: string): Promise<TaxReturn> {
    const updateData: any = { Status: status };
    if (status === 'Submitted') {
      updateData.SubmissionDate = new Date();
    }
    const res = await prisma.taxReturn.update({
      where: { ReturnID: id },
      data: updateData
    });
    await this.addFilingHistory(id, status, remarks);
    return mapTaxReturn(res);
  }

  // History
  async listFilingHistory(returnId: number): Promise<FilingHistory[]> {
    const list = await prisma.filingHistory.findMany({
      where: { ReturnID: returnId },
      orderBy: { ActionDate: 'desc' }
    });
    return list.map(h => ({
      FilingID: h.FilingID,
      ReturnID: h.ReturnID,
      ActionType: h.ActionType,
      ActionDate: h.ActionDate,
      Remarks: h.Remarks
    }));
  }

  async addFilingHistory(returnId: number, actionType: string, remarks?: string): Promise<FilingHistory> {
    const res = await prisma.filingHistory.create({
      data: {
        ReturnID: returnId,
        ActionType: actionType,
        Remarks: remarks
      }
    });
    return {
      FilingID: res.FilingID,
      ReturnID: res.ReturnID,
      ActionType: res.ActionType,
      ActionDate: res.ActionDate,
      Remarks: res.Remarks
    };
  }
}

export class PrismaNotificationRepository implements INotificationRepository {
  async create(userId: number, message: string, type: string): Promise<Notification> {
    const res = await prisma.notification.create({
      data: {
        UserID: userId,
        Message: message,
        Type: type
      }
    });
    return {
      NotificationID: res.NotificationID,
      UserID: res.UserID,
      Message: res.Message,
      Type: res.Type,
      Status: res.Status,
      SentDate: res.SentDate
    };
  }

  async listByUser(userId: number): Promise<Notification[]> {
    const list = await prisma.notification.findMany({
      where: { UserID: userId },
      orderBy: { SentDate: 'desc' }
    });
    return list.map(n => ({
      NotificationID: n.NotificationID,
      UserID: n.UserID,
      Message: n.Message,
      Type: n.Type,
      Status: n.Status,
      SentDate: n.SentDate
    }));
  }

  async markAsRead(id: number): Promise<Notification> {
    const res = await prisma.notification.update({
      where: { NotificationID: id },
      data: { Status: 'Read' }
    });
    return {
      NotificationID: res.NotificationID,
      UserID: res.UserID,
      Message: res.Message,
      Type: res.Type,
      Status: res.Status,
      SentDate: res.SentDate
    };
  }

  async markAllAsRead(userId: number): Promise<boolean> {
    await prisma.notification.updateMany({
      where: { UserID: userId, Status: 'Unread' },
      data: { Status: 'Read' }
    });
    return true;
  }
}

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async log(userId: number, activity: string, ipAddress: string): Promise<AuditLog> {
    const res = await prisma.auditLog.create({
      data: {
        UserID: userId,
        Activity: activity,
        IPAddress: ipAddress
      }
    });
    return {
      LogID: res.LogID,
      UserID: res.UserID,
      Activity: res.Activity,
      Timestamp: res.Timestamp,
      IPAddress: res.IPAddress
    };
  }

  async listAll(): Promise<AuditLog[]> {
    const list = await prisma.auditLog.findMany({
      orderBy: { Timestamp: 'desc' }
    });
    return list.map(al => ({
      LogID: al.LogID,
      UserID: al.UserID,
      Activity: al.Activity,
      Timestamp: al.Timestamp,
      IPAddress: al.IPAddress
    }));
  }
}

export class PrismaAutomationRepository implements IAutomationRepository {
  async saveOcrMetadata(data: Omit<OcrMetadata, 'OcrID'>): Promise<OcrMetadata> {
    const res = await prisma.ocrMetadata.create({
      data: {
        ReceiptID: data.ReceiptID,
        ExtractedMerchant: data.ExtractedMerchant,
        ExtractedAmount: data.ExtractedAmount,
        ExtractedDate: data.ExtractedDate,
        AutoCategory: data.AutoCategory,
        ConfidenceScore: data.ConfidenceScore,
        RawText: data.RawText
      }
    });
    return {
      OcrID: res.OcrID,
      ReceiptID: res.ReceiptID,
      ExtractedMerchant: res.ExtractedMerchant,
      ExtractedAmount: res.ExtractedAmount ? Number(res.ExtractedAmount) : null,
      ExtractedDate: res.ExtractedDate,
      AutoCategory: res.AutoCategory,
      ConfidenceScore: res.ConfidenceScore ? Number(res.ConfidenceScore) : null,
      RawText: res.RawText
    };
  }

  async saveBankStatement(
    statementData: Omit<BankStatement, 'StatementID' | 'UploadDate'>,
    transactionsData: Omit<BankTransaction, 'TransactionID' | 'StatementID'>[]
  ): Promise<{ statement: BankStatement; transactions: BankTransaction[] }> {
    const stmtRes = await prisma.bankStatement.create({
      data: {
        UserID: statementData.UserID,
        FileName: statementData.FileName,
        BankName: statementData.BankName,
        TotalTransactions: statementData.TotalTransactions,
        Transactions: {
          create: transactionsData.map(t => ({
            TransactionDate: t.TransactionDate,
            Description: t.Description,
            Amount: t.Amount,
            Type: t.Type,
            Category: t.Category,
            SyncStatus: t.SyncStatus
          }))
        }
      },
      include: { Transactions: true }
    });

    return {
      statement: {
        StatementID: stmtRes.StatementID,
        UserID: stmtRes.UserID,
        FileName: stmtRes.FileName,
        BankName: stmtRes.BankName,
        UploadDate: stmtRes.UploadDate,
        TotalTransactions: stmtRes.TotalTransactions
      },
      transactions: stmtRes.Transactions.map((t: any) => ({
        TransactionID: t.TransactionID,
        StatementID: t.StatementID,
        TransactionDate: t.TransactionDate,
        Description: t.Description,
        Amount: Number(t.Amount),
        Type: t.Type as 'INCOME' | 'EXPENSE',
        Category: t.Category,
        SyncStatus: t.SyncStatus
      }))
    };
  }

  async saveAuditRisk(data: Omit<AuditRisk, 'RiskID' | 'EvaluatedAt'>): Promise<AuditRisk> {
    const res = await prisma.auditRisk.create({
      data: {
        UserID: data.UserID,
        ReturnID: data.ReturnID,
        RiskScore: data.RiskScore,
        ScoreValue: data.ScoreValue,
        AnomalyFlags: JSON.stringify(data.AnomalyFlags),
        IRDComplianceStatus: data.IRDComplianceStatus
      }
    });
    return {
      RiskID: res.RiskID,
      UserID: res.UserID,
      ReturnID: res.ReturnID,
      RiskScore: res.RiskScore as 'LOW' | 'MEDIUM' | 'HIGH',
      ScoreValue: Number(res.ScoreValue),
      AnomalyFlags: JSON.parse(res.AnomalyFlags || '[]'),
      IRDComplianceStatus: res.IRDComplianceStatus,
      EvaluatedAt: res.EvaluatedAt
    };
  }

  async getLatestAuditRisk(userId: number): Promise<AuditRisk | null> {
    const res = await prisma.auditRisk.findFirst({
      where: { UserID: userId },
      orderBy: { EvaluatedAt: 'desc' }
    });
    if (!res) return null;
    return {
      RiskID: res.RiskID,
      UserID: res.UserID,
      ReturnID: res.ReturnID,
      RiskScore: res.RiskScore as 'LOW' | 'MEDIUM' | 'HIGH',
      ScoreValue: Number(res.ScoreValue),
      AnomalyFlags: JSON.parse(res.AnomalyFlags || '[]'),
      IRDComplianceStatus: res.IRDComplianceStatus,
      EvaluatedAt: res.EvaluatedAt
    };
  }
}
