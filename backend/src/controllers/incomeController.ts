import { Response } from 'express';
import { incomeRepository } from '../repositories';
import { logActivity } from '../helpers/auditLogger';
import { AuthenticatedRequest } from '../middleware/auth';

export async function addIncome(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { Source, Amount, IncomeType, Description, IncomeDate } = req.body;

    if (!Source || Amount === undefined || !IncomeType || !IncomeDate) {
      return res.status(400).json({ error: 'Source, Amount, IncomeType, and IncomeDate are required fields' });
    }

    const amt = parseFloat(Amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Income amount must be greater than zero' });
    }

    const income = await incomeRepository.create({
      UserID: req.user.UserID,
      Source,
      Amount: amt,
      IncomeType,
      Description: Description || null,
      IncomeDate: new Date(IncomeDate)
    });

    await logActivity(req.user.UserID, `Added income source: ${Source} ($${amt})`, req.ip);

    res.status(201).json({ message: 'Income successfully recorded', income });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listIncome(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { search, type } = req.query;
    const list = await incomeRepository.listByUser(
      req.user.UserID,
      search ? String(search) : undefined,
      type ? String(type) : undefined
    );

    res.status(200).json({ incomes: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateIncome(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Income ID' });

    const existing = await incomeRepository.findById(id);
    if (!existing || existing.UserID !== req.user.UserID) {
      return res.status(404).json({ error: 'Income record not found' });
    }

    const { Source, Amount, IncomeType, Description, IncomeDate } = req.body;
    const updateData: any = {};

    if (Source) updateData.Source = Source;
    if (Amount !== undefined) {
      const amt = parseFloat(Amount);
      if (isNaN(amt) || amt <= 0) {
        return res.status(400).json({ error: 'Income amount must be greater than zero' });
      }
      updateData.Amount = amt;
    }
    if (IncomeType) updateData.IncomeType = IncomeType;
    if (Description !== undefined) updateData.Description = Description;
    if (IncomeDate) updateData.IncomeDate = new Date(IncomeDate);

    const updated = await incomeRepository.update(id, updateData);
    await logActivity(req.user.UserID, `Updated income source: ${updated.Source}`, req.ip);

    res.status(200).json({ message: 'Income record successfully updated', income: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteIncome(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Income ID' });

    const existing = await incomeRepository.findById(id);
    if (!existing || existing.UserID !== req.user.UserID) {
      return res.status(404).json({ error: 'Income record not found' });
    }

    const deleted = await incomeRepository.delete(id);
    if (deleted) {
      await logActivity(req.user.UserID, `Deleted income source: ${existing.Source}`, req.ip);
      res.status(200).json({ message: 'Income record successfully deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete income record' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
