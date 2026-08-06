import cron from 'node-cron';
import { userRepository, notificationRepository, taxRepository } from '../repositories';

export function initCronJobs() {
  console.log('[Cron] Initializing background task schedulers.');

  // Run at midnight every day
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily tax deadline checks and alerts...');
    try {
      const allUsers = await userRepository.listAll();
      const currentYear = new Date().getFullYear();
      
      for (const user of allUsers) {
        if (user.Role === 'System Administrator' || user.Role === 'Accountant') continue;

        // Check if user has filed for the current year
        const userReturns = await taxRepository.listReturnsByUser(user.UserID);
        const currentYearReturn = userReturns.find(r => r.TaxYear === currentYear);

        if (!currentYearReturn || currentYearReturn.Status === 'Pending') {
          // Send notification alert
          const deadlineMessage = `Reminder: Your tax return filing for the year ${currentYear} is due. Please submit your income and expenses to calculate your return.`;
          await notificationRepository.create(user.UserID, deadlineMessage, 'Deadline');
          console.log(`[Cron] Sent filing reminder to ${user.Name} (ID: ${user.UserID})`);
        }
      }
    } catch (error) {
      console.error('[Cron] Error running daily tax deadline checks:', error);
    }
  });
}
