// drizzle/seed.ts - Static Data Seeding for SEMDEX

import { db } from './db';
import * as schema from './schema';

export async function seedDatabase() {
  console.log('🌱 Seeding SEMDEX database...');

  // 1. Seed Users (2 hardcoded)
  await db.insert(schema.users).values([
    {
      id: 1,
      email: 'pbernardproxy@gmail.com',
      phone: '+230 54557219',
      fullName: 'Patrick Ian Bernard',
      sharesOwned: 5600000,
      loginMethod: 'hardcoded',
      isActive: true,
    },
    {
      id: 2,
      email: 'audrey.l.brutus@gmail.com',
      phone: '+230 54951814',
      fullName: 'Marie Audrey Laura Brutus',
      sharesOwned: 5600000,
      loginMethod: 'hardcoded',
      isActive: true,
    },
  ]);

  // 2. Seed Share Holding (1 combined record)
  await db.insert(schema.shareHolding).values({
    totalShares: 11200000,
    sharePrice: '460.00',
    portfolioValue: '5152000000.00',
    company: 'MCB Group Ltd',
    ticker: 'MCBMU',
    currency: 'MUR',
  });

  // 3. Seed Sale Allocation (3 brokers)
  await db.insert(schema.saleAllocation).values([
    {
      entityName: 'Swan Securities Ltd',
      sharesAllocated: 60000,
      allocationPercentage: '30.00',
      contactEmail: 'info@swansecurities.mu',
      contactPhone: '+230 403 7000',
      status: 'finalized',
    },
    {
      entityName: 'DTOS Capital Markets Ltd',
      sharesAllocated: 40000,
      allocationPercentage: '20.00',
      contactEmail: 'info@dtos.mu',
      contactPhone: '+230 202 9000',
      status: 'finalized',
    },
    {
      entityName: 'DMH Stockbroking Ltd',
      sharesAllocated: 100000,
      allocationPercentage: '50.00',
      contactEmail: 'info@dmh.mu',
      contactPhone: '+230 207 6400',
      status: 'finalized',
    },
  ]);

  // 4. Seed Dividend History (6 records)
  await db.insert(schema.dividendHistory).values([
    {
      year: 2020,
      dividendPerShare: '9.00',
      totalEntitlement: '100800000.00', // 11.2M × 9.00
      paymentDate: new Date('2020-12-15'),
      status: 'paid',
      isSecondDividend: false,
    },
    {
      year: 2021,
      dividendPerShare: '10.50',
      totalEntitlement: '117600000.00', // 11.2M × 10.50
      paymentDate: new Date('2021-12-15'),
      status: 'paid',
      isSecondDividend: false,
    },
    {
      year: 2022,
      dividendPerShare: '11.00',
      totalEntitlement: '123200000.00', // 11.2M × 11.00
      paymentDate: new Date('2022-12-15'),
      status: 'paid',
      isSecondDividend: false,
    },
    {
      year: 2023,
      dividendPerShare: '12.00',
      totalEntitlement: '134400000.00', // 11.2M × 12.00
      paymentDate: new Date('2023-12-15'),
      status: 'paid',
      isSecondDividend: false,
    },
    {
      year: 2024,
      dividendPerShare: '13.00',
      totalEntitlement: '145600000.00', // 11.2M × 13.00
      paymentDate: new Date('2024-06-15'),
      status: 'paid',
      isSecondDividend: false,
    },
    {
      year: 2024,
      dividendPerShare: '10.50',
      totalEntitlement: '117600000.00', // 11.2M × 10.50
      paymentDate: new Date('2024-12-15'),
      status: 'paid',
      isSecondDividend: true,
    },
  ]);

  // 5. Seed Court Approved Sale (1 record)
  await db.insert(schema.courtApprovedSale).values({
    sharesSold: 200000,
    settlementAmount: '117200300.21',
    settlementPurpose: 'Settlement of court-approved sale',
    saleFinalized: new Date('2025-12-07'),
    paymentWindow: new Date('2025-12-31'),
    bankClearanceDeadline: new Date('2026-01-10'),
    courtOrderReference: 'SCJ-2025-00789',
    status: 'finalized',
  });

  // 6. Seed Remaining Shares (1 record)
  await db.insert(schema.remainingShares).values({
    totalShares: 11000000,
    status: 'court_custody',
    lockInPeriod: 3,
    lockInExpiryDate: new Date('2028-12-07'),
    dividendPayable: 'yes',
    custodianDetails: 'Supreme Court of Mauritius - Custody Division',
  });

  // 7. Seed Approvals/Brokers (3 brokers)
  await db.insert(schema.approvalsBrokers).values([
    {
      brokerName: 'Swan Securities Ltd',
      licenseNumber: 'FSC-SEM-001',
      contactPerson: 'Raj Kumar',
      email: 'raj.kumar@swansecurities.mu',
      phone: '+230 403 7000',
      address: '10 Intendance Street, Port Louis, Mauritius',
      approvalStatus: 'approved',
      approvedDate: new Date('2025-11-15'),
    },
    {
      brokerName: 'DTOS Capital Markets Ltd',
      licenseNumber: 'FSC-SEM-002',
      contactPerson: 'Sophie Chen',
      email: 'sophie.chen@dtos.mu',
      phone: '+230 202 9000',
      address: '5 President John Kennedy Street, Port Louis, Mauritius',
      approvalStatus: 'approved',
      approvedDate: new Date('2025-11-15'),
    },
    {
      brokerName: 'DMH Stockbroking Ltd',
      licenseNumber: 'FSC-SEM-003',
      contactPerson: 'Marc Harel',
      email: 'marc.harel@dmh.mu',
      phone: '+230 207 6400',
      address: '1 CyberCity, Ebene, Mauritius',
      approvalStatus: 'approved',
      approvedDate: new Date('2025-11-15'),
    },
  ]);

  // 8. Seed System Settings
  await db.insert(schema.systemSettings).values([
    {
      settingKey: 'APP_NAME',
      settingValue: 'SEMDEX',
      dataType: 'string',
      description: 'Application name',
      isEditable: false,
    },
    {
      settingKey: 'APP_VERSION',
      settingValue: '1.0.0',
      dataType: 'string',
      description: 'Current application version',
      isEditable: false,
    },
    {
      settingKey: 'OFFLINE_MODE',
      settingValue: 'true',
      dataType: 'boolean',
      description: 'Enable offline functionality',
      isEditable: false,
    },
    {
      settingKey: 'SHARE_PRICE_REFERENCE',
      settingValue: '460.00',
      dataType: 'decimal',
      description: 'MCB Group Ltd reference share price',
      isEditable: false,
    },
    {
      settingKey: 'CURRENCY',
      settingValue: 'MUR',
      dataType: 'string',
      description: 'Primary currency',
      isEditable: false,
    },
  ]);

  console.log('✅ Database seeded successfully!');
}

// Run seeding
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
