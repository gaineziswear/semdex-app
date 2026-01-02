// server/routers.ts - Complete API Router for SEMDEX

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './_core/trpc';
import { db } from './db';
import * as schema from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { login, logout, generateMagicLink, loginSchema } from './auth';

// ============================================
// AUTH ROUTER
// ============================================
const authRouter = router({
  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, ctx.user.id))
      .limit(1);

    return user;
  }),

  // Login
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      return login(input, ctx.ip);
    }),

  // Logout
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    return logout(ctx.user.id, ctx.ip);
  }),

  // Generate magic link
  magicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const link = await generateMagicLink(input.email);
      return { success: true, link };
    }),
});

// ============================================
// DASHBOARD ROUTER
// ============================================
const dashboardRouter = router({
  // Get overview data
  getOverview: protectedProcedure.query(async () => {
    const [holding] = await db.select().from(schema.shareHolding).limit(1);
    const [sale] = await db.select().from(schema.courtApprovedSale).limit(1);
    const [remaining] = await db.select().from(schema.remainingShares).limit(1);

    // Recent transactions (last 10)
    const recentTxs = await db
      .select()
      .from(schema.transactions)
      .orderBy(desc(schema.transactions.timestamp))
      .limit(10);

    return {
      totalShares: holding?.totalShares || 0,
      sharePrice: holding?.sharePrice || '0',
      portfolioValue: holding?.portfolioValue || '0',
      company: holding?.company || '',
      ticker: holding?.ticker || '',
      sharesSold: sale?.sharesSold || 0,
      sharesRemaining: remaining?.totalShares || 0,
      recentTransactions: recentTxs,
    };
  }),

  // Get shareholding details
  getShareholding: protectedProcedure.query(async () => {
    const [holding] = await db.select().from(schema.shareHolding).limit(1);
    const users = await db.select().from(schema.users);

    return {
      combined: holding,
      breakdown: users.map(u => ({
        name: u.fullName,
        shares: u.sharesOwned,
        percentage: ((u.sharesOwned / (holding?.totalShares || 1)) * 100).toFixed(2),
      })),
    };
  }),

  // Get sale breakdown
  getSaleBreakdown: protectedProcedure.query(async () => {
    const [sale] = await db.select().from(schema.courtApprovedSale).limit(1);
    const allocations = await db.select().from(schema.saleAllocation);
    const [holding] = await db.select().from(schema.shareHolding).limit(1);

    const sharePrice = parseFloat(holding?.sharePrice || '0');
    const soldValue = (sale?.sharesSold || 0) * sharePrice;
    const remainingValue = ((holding?.totalShares || 0) - (sale?.sharesSold || 0)) * sharePrice;

    return {
      sale,
      allocations,
      comparison: {
        sold: {
          shares: sale?.sharesSold || 0,
          value: soldValue,
        },
        retained: {
          shares: (holding?.totalShares || 0) - (sale?.sharesSold || 0),
          value: remainingValue,
        },
      },
    };
  }),

  // Get dividend history
  getDividends: protectedProcedure.query(async () => {
    const dividends = await db
      .select()
      .from(schema.dividendHistory)
      .orderBy(schema.dividendHistory.year);

    const [remaining] = await db.select().from(schema.remainingShares).limit(1);

    // Calculate projected entitlements for remaining shares
    const projected = dividends.map(d => ({
      ...d,
      projectedEntitlement: (remaining?.totalShares || 0) * parseFloat(d.dividendPerShare),
    }));

    return {
      history: dividends,
      projected,
      remainingShares: remaining?.totalShares || 0,
    };
  }),

  // Get transactions
  getTransactions: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(schema.transactions)
        .orderBy(desc(schema.transactions.timestamp))
        .limit(input.limit);
    }),

  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      return db
        .select()
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.userId, ctx.user.id))
        .orderBy(desc(schema.auditLogs.timestamp))
        .limit(input.limit);
    }),

  // Get brokers
  getBrokers: protectedProcedure.query(async () => {
    return db.select().from(schema.approvalsBrokers);
  }),

  // Get system settings
  getSettings: protectedProcedure.query(async () => {
    return db.select().from(schema.systemSettings);
  }),
});

// ============================================
// LOG ROUTER (for transaction logging)
// ============================================
const logRouter = router({
  // Log transaction
  logTransaction: protectedProcedure
    .input(
      z.object({
        transactionType: z.string(),
        description: z.string(),
        amount: z.string().optional(),
        sharesAffected: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.insert(schema.transactions).values({
        userId: ctx.user.id,
        transactionType: input.transactionType,
        description: input.description,
        amount: input.amount,
        sharesAffected: input.sharesAffected,
        ipAddress: ctx.ip,
      });
    }),

  // Log audit event
  logAudit: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        module: z.string(),
        details: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.insert(schema.auditLogs).values({
        userId: ctx.user.id,
        action: input.action,
        module: input.module,
        details: input.details,
        ipAddress: ctx.ip,
      });
    }),
});

// ============================================
// APP ROUTER (combine all routers)
// ============================================
export const appRouter = router({
  auth: authRouter,
  dashboard: dashboardRouter,
  log: logRouter,
});

export type AppRouter = typeof appRouter;
