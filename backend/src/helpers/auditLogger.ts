import { auditLogRepository } from '../repositories';

export async function logActivity(userId: number, activity: string, ipAddress: any = '127.0.0.1') {
  try {
    const ip = typeof ipAddress === 'string' ? ipAddress : (Array.isArray(ipAddress) ? ipAddress[0] : '127.0.0.1');
    await auditLogRepository.log(userId, activity, ip);
    console.log(`[Audit] User ${userId}: ${activity}`);
  } catch (error) {
    console.error('[AuditLogger] Failed to write audit log:', error);
  }
}
