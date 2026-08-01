import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, requireRole } from '../middleware/auth';

// Controller Imports
import * as authController from '../controllers/authController';
import * as incomeController from '../controllers/incomeController';
import * as expenseController from '../controllers/expenseController';
import * as taxController from '../controllers/taxController';
import * as accountantController from '../controllers/accountantController';
import * as adminController from '../controllers/adminController';
import * as automationController from '../controllers/automationController';
import { notificationRepository } from '../repositories';

const router = Router();

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration for Receipts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg/png) or PDF receipts are allowed'));
  }
});

// --- AUTHENTICATION ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateJWT, authController.getProfile);
router.put('/auth/profile', authenticateJWT, authController.updateProfile);

// --- INCOME MODULE ROUTES ---
router.post('/income', authenticateJWT, incomeController.addIncome);
router.get('/income', authenticateJWT, incomeController.listIncome);
router.put('/income/:id', authenticateJWT, incomeController.updateIncome);
router.delete('/income/:id', authenticateJWT, incomeController.deleteIncome);

// --- EXPENSE MODULE ROUTES ---
router.get('/expenses/categories', authenticateJWT, expenseController.listCategories);
router.post('/expenses', authenticateJWT, expenseController.addExpense);
router.get('/expenses', authenticateJWT, expenseController.listExpenses);
router.put('/expenses/:id', authenticateJWT, expenseController.updateExpense);
router.delete('/expenses/:id', authenticateJWT, expenseController.deleteExpense);
router.post('/expenses/:id/receipt', authenticateJWT, upload.single('receipt'), expenseController.uploadReceipt);

// --- TAX MODULE & FILING ROUTES ---
router.get('/tax/calculate', authenticateJWT, taxController.calculateTax);
router.post('/tax/return', authenticateJWT, taxController.generateTaxReturn);
router.post('/tax/return/:id/submit', authenticateJWT, taxController.submitTaxReturn);
router.get('/tax/returns', authenticateJWT, taxController.listReturns);
router.get('/tax/returns/:id', authenticateJWT, taxController.getReturnById);

router.post('/tax/deductions', authenticateJWT, taxController.addDeduction);
router.get('/tax/deductions', authenticateJWT, taxController.listDeductions);
router.delete('/tax/deductions/:id', authenticateJWT, taxController.deleteDeduction);

router.post('/tax/credits', authenticateJWT, taxController.addCredit);
router.get('/tax/credits', authenticateJWT, taxController.listCredits);
router.delete('/tax/credits/:id', authenticateJWT, taxController.deleteCredit);

// --- ACCOUNTANT PORTAL ROUTES ---
router.get('/accountant/clients', authenticateJWT, requireRole(['Accountant']), accountantController.listClients);
router.post('/accountant/clients', authenticateJWT, requireRole(['Accountant']), accountantController.assignClient);
router.delete('/accountant/clients/:clientId', authenticateJWT, requireRole(['Accountant']), accountantController.removeClient);
router.post('/accountant/returns/:returnId/review', authenticateJWT, requireRole(['Accountant']), accountantController.reviewClientReturn);
router.post('/accountant/returns/:returnId/submit', authenticateJWT, requireRole(['Accountant']), accountantController.submitOnBehalf);

// --- ADMIN PORTAL ROUTES ---
router.get('/admin/users', authenticateJWT, requireRole(['System Administrator']), adminController.listUsers);
router.put('/admin/users/:userId/status', authenticateJWT, requireRole(['System Administrator']), adminController.updateUserStatus);
router.get('/admin/rules', authenticateJWT, requireRole(['System Administrator']), adminController.listRules);
router.post('/admin/rules', authenticateJWT, requireRole(['System Administrator']), adminController.createRule);
router.put('/admin/rules/:id', authenticateJWT, requireRole(['System Administrator']), adminController.updateRule);
router.delete('/admin/rules/:id', authenticateJWT, requireRole(['System Administrator']), adminController.deleteRule);
router.get('/admin/logs', authenticateJWT, requireRole(['System Administrator']), adminController.getAuditLogs);
router.get('/admin/health', authenticateJWT, requireRole(['System Administrator']), adminController.getSystemHealth);

// --- NOTIFICATIONS ROUTES ---
router.get('/notifications', authenticateJWT, async (req: any, res) => {
  try {
    const list = await notificationRepository.listByUser(req.user.UserID);
    res.status(200).json({ notifications: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/:id/read', authenticateJWT, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid notification ID' });
    const notif = await notificationRepository.markAsRead(id);
    res.status(200).json({ notification: notif });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/read-all', authenticateJWT, async (req: any, res) => {
  try {
    await notificationRepository.markAllAsRead(req.user.UserID);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- AUTOMATION MODULE ROUTES ---
router.post('/automation/ocr-scan', authenticateJWT, automationController.processReceiptOCR);
router.post('/automation/bank-ingest', authenticateJWT, automationController.ingestBankStatement);
router.get('/automation/audit-risk/:userId?', authenticateJWT, automationController.evaluateAuditRisk);

export default router;
