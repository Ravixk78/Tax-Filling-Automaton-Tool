import { Response } from 'express';
import { accountantRepository, userRepository, taxRepository, notificationRepository } from '../repositories';
import { logActivity } from '../helpers/auditLogger';
import { AuthenticatedRequest } from '../middleware/auth';

export async function listClients(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const accountant = await accountantRepository.findByEmail(req.user.Email);
    if (!accountant) {
      return res.status(404).json({ error: 'Accountant profile not found' });
    }

    const clients = await accountantRepository.listClients(accountant.AccountantID);
    res.status(200).json({ clients });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function assignClient(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { clientEmail } = req.body;
    if (!clientEmail) return res.status(400).json({ error: 'Client Email is required' });

    const accountant = await accountantRepository.findByEmail(req.user.Email);
    if (!accountant) {
      return res.status(404).json({ error: 'Accountant profile not found' });
    }

    const clientUser = await userRepository.findByEmail(clientEmail);
    if (!clientUser) {
      return res.status(404).json({ error: 'Client user not found' });
    }

    const assignment = await accountantRepository.assignClient(accountant.AccountantID, clientUser.UserID);
    await logActivity(req.user.UserID, `Assigned client ${clientUser.Email} to accountant`, req.ip);
    await notificationRepository.create(clientUser.UserID, `Accountant ${accountant.Name} has been assigned to manage your tax filings.`, 'General');

    res.status(200).json({ message: 'Client successfully assigned', assignment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeClient(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const clientUserId = parseInt(req.params.clientId as string);
    if (isNaN(clientUserId)) return res.status(400).json({ error: 'Invalid Client User ID' });

    const accountant = await accountantRepository.findByEmail(req.user.Email);
    if (!accountant) {
      return res.status(404).json({ error: 'Accountant profile not found' });
    }

    const removed = await accountantRepository.removeClient(accountant.AccountantID, clientUserId);
    if (removed) {
      await logActivity(req.user.UserID, `Removed client ID ${clientUserId} from assignment`, req.ip);
      await notificationRepository.create(clientUserId, `Accountant ${accountant.Name} is no longer assigned to your account.`, 'General');
      res.status(200).json({ message: 'Client successfully unassigned' });
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function reviewClientReturn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const returnId = parseInt(req.params.returnId as string);
    if (isNaN(returnId)) return res.status(400).json({ error: 'Invalid Return ID' });

    const { status, remarks } = req.body; // e.g. status = 'Approved' or 'Rejected'
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be either 'Approved' or 'Rejected'" });
    }

    const accountant = await accountantRepository.findByEmail(req.user.Email);
    if (!accountant) {
      return res.status(404).json({ error: 'Accountant profile not found' });
    }

    const taxReturn = await taxRepository.findReturnById(returnId);
    if (!taxReturn) return res.status(404).json({ error: 'Tax return not found' });

    // Verify client is assigned to this accountant
    const clients = await accountantRepository.listClients(accountant.AccountantID);
    const isAssigned = clients.some(c => c.UserID === taxReturn.UserID);

    if (!isAssigned) {
      return res.status(403).json({ error: 'Forbidden: Client is not assigned to you' });
    }

    const updated = await taxRepository.updateReturnStatus(returnId, status, remarks || `Review completed by Accountant Alice.`);
    
    await logActivity(req.user.UserID, `Reviewed client return ID ${returnId}. New status: ${status}`, req.ip);
    await notificationRepository.create(
      taxReturn.UserID,
      `Your tax return for ${taxReturn.TaxYear} has been reviewed and ${status.toUpperCase()} by your accountant: ${remarks || ''}`,
      'FilingStatus'
    );

    res.status(200).json({ message: `Tax return reviewed and ${status.toLowerCase()} successfully`, taxReturn: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function submitOnBehalf(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const returnId = parseInt(req.params.returnId as string);
    if (isNaN(returnId)) return res.status(400).json({ error: 'Invalid Return ID' });

    const accountant = await accountantRepository.findByEmail(req.user.Email);
    if (!accountant) {
      return res.status(404).json({ error: 'Accountant profile not found' });
    }

    const taxReturn = await taxRepository.findReturnById(returnId);
    if (!taxReturn) return res.status(404).json({ error: 'Tax return not found' });

    const clients = await accountantRepository.listClients(accountant.AccountantID);
    const isAssigned = clients.some(c => c.UserID === taxReturn.UserID);

    if (!isAssigned) {
      return res.status(403).json({ error: 'Forbidden: Client is not assigned to you' });
    }

    const updated = await taxRepository.updateReturnStatus(returnId, 'Submitted', `Submitted by Accountant Alice on behalf of client.`);

    await logActivity(req.user.UserID, `Submitted tax return ID ${returnId} on behalf of user ${taxReturn.UserID}`, req.ip);
    await notificationRepository.create(
      taxReturn.UserID,
      `Your tax return for ${taxReturn.TaxYear} has been submitted on your behalf by your accountant.`,
      'FilingStatus'
    );

    res.status(200).json({ message: 'Tax return successfully submitted on client behalf', taxReturn: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
