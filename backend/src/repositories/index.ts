import { isDbConnected } from '../db';
import * as inMemory from './inMemory';
import * as prismaRepo from './prisma';
import {
  IUserRepository,
  IAccountantRepository,
  IIncomeRepository,
  IExpenseRepository,
  ITaxRepository,
  INotificationRepository,
  IAuditLogRepository,
  IAutomationRepository
} from './types';

export let userRepository: IUserRepository;
export let accountantRepository: IAccountantRepository;
export let incomeRepository: IIncomeRepository;
export let expenseRepository: IExpenseRepository;
export let taxRepository: ITaxRepository;
export let notificationRepository: INotificationRepository;
export let auditLogRepository: IAuditLogRepository;
export let automationRepository: IAutomationRepository;

export function initializeRepositories() {
  if (isDbConnected) {
    console.log('[Repositories] Initializing Prisma Database Repositories.');
    userRepository = new prismaRepo.PrismaUserRepository();
    accountantRepository = new prismaRepo.PrismaAccountantRepository();
    incomeRepository = new prismaRepo.PrismaIncomeRepository();
    expenseRepository = new prismaRepo.PrismaExpenseRepository();
    taxRepository = new prismaRepo.PrismaTaxRepository();
    notificationRepository = new prismaRepo.PrismaNotificationRepository();
    auditLogRepository = new prismaRepo.PrismaAuditLogRepository();
    automationRepository = new prismaRepo.PrismaAutomationRepository();
  } else {
    console.log('[Repositories] Initializing In-Memory Fallback Repositories.');
    userRepository = new inMemory.InMemoryUserRepository();
    accountantRepository = new inMemory.InMemoryAccountantRepository();
    incomeRepository = new inMemory.InMemoryIncomeRepository();
    expenseRepository = new inMemory.InMemoryExpenseRepository();
    taxRepository = new inMemory.InMemoryTaxRepository();
    notificationRepository = new inMemory.InMemoryNotificationRepository();
    auditLogRepository = new inMemory.InMemoryAuditLogRepository();
    automationRepository = new inMemory.InMemoryAutomationRepository();
  }
}
export * from './types';
