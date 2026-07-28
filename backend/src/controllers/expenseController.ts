import { Response } from 'express';
import { expenseRepository } from '../repositories';
import { logActivity } from '../helpers/auditLogger';
import { AuthenticatedRequest } from '../middleware/auth';

export async function addExpense(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { Description, CategoryID, Amount, ExpenseDate } = req.body;

    if (!Description || !CategoryID || Amount === undefined || !ExpenseDate) {
      return res.status(400).json({ error: 'Description, CategoryID, Amount, and ExpenseDate are required' });
    }

    const amt = parseFloat(Amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Expense amount must be greater than zero' });
    }

    const catId = parseInt(CategoryID);
    if (isNaN(catId)) return res.status(400).json({ error: 'Invalid Category ID' });

    const expense = await expenseRepository.create({
      UserID: req.user.UserID,
      CategoryID: catId,
      Amount: amt,
      Description,
      ExpenseDate: new Date(ExpenseDate)
    });

    await logActivity(req.user.UserID, `Added expense: ${Description} ($${amt})`, req.ip);

    res.status(201).json({ message: 'Expense successfully recorded', expense });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listExpenses(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { search, categoryId } = req.query;
    const catId = categoryId ? parseInt(String(categoryId)) : undefined;

    const list = await expenseRepository.listByUser(
      req.user.UserID,
      search ? String(search) : undefined,
      catId
    );

    res.status(200).json({ expenses: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateExpense(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Expense ID' });

    const existing = await expenseRepository.findById(id);
    if (!existing || existing.UserID !== req.user.UserID) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    const { Description, CategoryID, Amount, ExpenseDate } = req.body;
    const updateData: any = {};

    if (Description) updateData.Description = Description;
    if (CategoryID !== undefined) {
      const catId = parseInt(CategoryID);
      if (isNaN(catId)) return res.status(400).json({ error: 'Invalid Category ID' });
      updateData.CategoryID = catId;
    }
    if (Amount !== undefined) {
      const amt = parseFloat(Amount);
      if (isNaN(amt) || amt <= 0) {
        return res.status(400).json({ error: 'Expense amount must be greater than zero' });
      }
      updateData.Amount = amt;
    }
    if (ExpenseDate) updateData.ExpenseDate = new Date(ExpenseDate);

    const updated = await expenseRepository.update(id, updateData);
    await logActivity(req.user.UserID, `Updated expense record: ${updated.Description}`, req.ip);

    res.status(200).json({ message: 'Expense record successfully updated', expense: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteExpense(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Expense ID' });

    const existing = await expenseRepository.findById(id);
    if (!existing || existing.UserID !== req.user.UserID) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    const deleted = await expenseRepository.delete(id);
    if (deleted) {
      await logActivity(req.user.UserID, `Deleted expense: ${existing.Description}`, req.ip);
      res.status(200).json({ message: 'Expense record successfully deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete expense record' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listCategories(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await expenseRepository.listCategories();
    res.status(200).json({ categories: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function uploadReceipt(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const expenseId = parseInt(req.params.id as string);
    if (isNaN(expenseId)) return res.status(400).json({ error: 'Invalid Expense ID' });

    const expense = await expenseRepository.findById(expenseId);
    if (!expense || expense.UserID !== req.user.UserID) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No receipt file uploaded' });
    }

    // Save path
    const filePath = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    const receipt = await expenseRepository.addReceipt(expenseId, fileName, filePath);
    await logActivity(req.user.UserID, `Uploaded receipt for expense: ${expense.Description}`, req.ip);

    res.status(200).json({
      message: 'Receipt uploaded successfully',
      receipt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
