// drizzle/schema.ts - Complete Database Schema for SEMDEX

import { pgTable, serial, text, integer, decimal, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

// 1. Users Table (2 hardcoded users)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  sharesOwned: integer('shares_owned').notNull(), // 5,600,000 each
  loginMethod: varchar('login_method', { length: 50 }).default('hardcoded'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  isActive: boolean('is_active').default(true),
});

// 2. Share Holding (1 combined record)
export const shareHolding = pgTable('share_holding', {
  id: serial('id').primaryKey(),
  totalShares: integer('total_shares').notNull(), // 11,200,000
  sharePrice: decimal('share_price', { precision: 10, scale: 2 }).notNull(), // 460.00
  portfolioValue: decimal('portfolio_value', { precision: 15, scale: 2 }).notNull(), // 5,152,000,000
  company: varchar('company', { length: 255 }).notNull(), // MCB Group Ltd
  ticker: varchar('ticker', { length: 10 }).notNull(), // MCBMU
  currency: varchar('currency', { length: 3 }).default('MUR'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// 3. Sale Allocation (3 broker records)
export const saleAllocation = pgTable('sale_allocation', {
  id: serial('id').primaryKey(),
  entityName: varchar('entity_name', { length: 255 }).notNull(),
  sharesAllocated: integer('shares_allocated').notNull(),
  allocationPercentage: decimal('allocation_percentage', { precision: 5, scale: 2 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  status: varchar('status', { length: 50 }).default('finalized'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Dividend History (6 records: 2020-2024 + extra 2024)
export const dividendHistory = pgTable('dividend_history', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  dividendPerShare: decimal('dividend_per_share', { precision: 10, scale: 2 }).notNull(),
  totalEntitlement: decimal('total_entitlement', { precision: 15, scale: 2 }), // Calculated
  paymentDate: timestamp('payment_date'),
  status: varchar('status', { length: 50 }).default('paid'),
  isSecondDividend: boolean('is_second_dividend').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Court Approved Sale (1 record)
export const courtApprovedSale = pgTable('court_approved_sale', {
  id: serial('id').primaryKey(),
  sharesSold: integer('shares_sold').notNull(), // 200,000
  settlementAmount: decimal('settlement_amount', { precision: 15, scale: 2 }).notNull(), // 117,200,300.21
  settlementPurpose: text('settlement_purpose').notNull(),
  saleFinalized: timestamp('sale_finalized').notNull(), // 2025-12-07
  paymentWindow: timestamp('payment_window').notNull(), // 2025-12-31
  bankClearanceDeadline: timestamp('bank_clearance_deadline').notNull(), // 2026-01-10
  courtOrderReference: varchar('court_order_reference', { length: 100 }),
  status: varchar('status', { length: 50 }).default('finalized'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Remaining Shares (1 record)
export const remainingShares = pgTable('remaining_shares', {
  id: serial('id').primaryKey(),
  totalShares: integer('total_shares').notNull(), // 11,000,000
  status: varchar('status', { length: 50 }).default('court_custody'),
  lockInPeriod: integer('lock_in_period').notNull(), // 3 years
  lockInExpiryDate: timestamp('lock_in_expiry_date'),
  dividendPayable: varchar('dividend_payable', { length: 3 }).default('yes'),
  custodianDetails: text('custodian_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Transactions (audit trail)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  transactionType: varchar('transaction_type', { length: 100 }).notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }),
  sharesAffected: integer('shares_affected'),
  ipAddress: varchar('ip_address', { length: 45 }),
  deviceInfo: text('device_info'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 8. Audit Logs (system activity)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  module: varchar('module', { length: 100 }).notNull(),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 9. Approvals/Brokers (broker information)
export const approvalsBrokers = pgTable('approvals_brokers', {
  id: serial('id').primaryKey(),
  brokerName: varchar('broker_name', { length: 255 }).notNull(),
  licenseNumber: varchar('license_number', { length: 100 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  approvalStatus: varchar('approval_status', { length: 50 }).default('approved'),
  approvedDate: timestamp('approved_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. System Settings (configuration)
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value').notNull(),
  dataType: varchar('data_type', { length: 50 }).default('string'),
  description: text('description'),
  isEditable: boolean('is_editable').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});
