import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export let isDbConnected = false;

export async function checkDbConnection() {
  try {
    await prisma.$connect();
    isDbConnected = true;
    console.log('[Database] Connected to PostgreSQL successfully.');
  } catch (error) {
    isDbConnected = false;
    console.warn('[Database] Connection failed. Fallback to In-Memory Data Tables enabled for local execution.');
  }
}
