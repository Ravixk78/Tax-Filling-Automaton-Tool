import { Request, Response } from 'express';
import { userRepository, taxRepository, auditLogRepository } from '../repositories';
import { logActivity } from '../helpers/auditLogger';
import { AuthenticatedRequest } from '../middleware/auth';
import { isDbConnected } from '../db';
import os from 'os';

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await userRepository.listAll();
    const sanitised = list.map(u => ({
      UserID: u.UserID,
      Name: u.Name,
      Email: u.Email,
      PhoneNumber: u.PhoneNumber,
      Role: u.Role,
      Status: u.Status,
      CreatedDate: u.CreatedDate,
      LastLogin: u.LastLogin
    }));
    res.status(200).json({ users: sanitised });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.userId as string);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid User ID' });

    const { status } = req.body; // 'Active' or 'Suspended'
    if (!status || !['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'Active' or 'Suspended'" });
    }

    const updated = await userRepository.update(userId, { Status: status });
    await logActivity(req.user!.UserID, `Updated user status for ID ${userId} to ${status}`, req.ip);

    res.status(200).json({
      message: `User account status successfully updated to ${status}`,
      user: { UserID: updated.UserID, Email: updated.Email, Status: updated.Status }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listRules(req: AuthenticatedRequest, res: Response) {
  try {
    const rules = await taxRepository.listRules();
    res.status(200).json({ taxRules: rules });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createRule(req: AuthenticatedRequest, res: Response) {
  try {
    const { RuleName, Description, EffectiveDate, TaxRate } = req.body;
    if (!RuleName || TaxRate === undefined || !EffectiveDate) {
      return res.status(400).json({ error: 'RuleName, TaxRate, and EffectiveDate are required' });
    }

    const rate = parseFloat(TaxRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ error: 'TaxRate must be a decimal between 0 and 100' });
    }

    const rule = await taxRepository.createRule({
      RuleName,
      Description: Description || null,
      EffectiveDate: new Date(EffectiveDate),
      TaxRate: rate
    });

    await logActivity(req.user!.UserID, `Created tax rule: ${RuleName} (${rate}%)`, req.ip);

    res.status(201).json({ message: 'Tax rule successfully created', taxRule: rule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateRule(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Rule ID' });

    const { RuleName, Description, EffectiveDate, TaxRate } = req.body;
    const updateData: any = {};

    if (RuleName) updateData.RuleName = RuleName;
    if (Description !== undefined) updateData.Description = Description;
    if (EffectiveDate) updateData.EffectiveDate = new Date(EffectiveDate);
    if (TaxRate !== undefined) {
      const rate = parseFloat(TaxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ error: 'TaxRate must be between 0 and 100' });
      }
      updateData.TaxRate = rate;
    }

    const updated = await taxRepository.updateRule(id, updateData);
    await logActivity(req.user!.UserID, `Updated tax rule: ${updated.RuleName}`, req.ip);

    res.status(200).json({ message: 'Tax rule successfully updated', taxRule: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteRule(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Rule ID' });

    const deleted = await taxRepository.deleteRule(id);
    if (deleted) {
      await logActivity(req.user!.UserID, `Deleted tax rule ID ${id}`, req.ip);
      res.status(200).json({ message: 'Tax rule successfully deleted' });
    } else {
      res.status(404).json({ error: 'Tax rule not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await auditLogRepository.listAll();
    res.status(200).json({ auditLogs: logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSystemHealth(req: AuthenticatedRequest, res: Response) {
  try {
    // Generate active system statistics
    const load = os.loadavg();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memoryUsagePct = Math.round(((totalMem - freeMem) / totalMem) * 100);

    res.status(200).json({
      health: {
        status: 'Healthy',
        database: isDbConnected ? 'Connected (PostgreSQL)' : 'Connected (In-Memory Fallback Mode)',
        cpuUsagePct: Math.round((load[0] || 0.15) * 100) % 100, // Safe CPU mock calculation from OS
        memoryUsagePct,
        uptimeSeconds: Math.round(os.uptime()),
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
