# Sales Management Module — DB Migration Notes

## Overview
Two migration files added as part of the Sales Management module build.
No existing tables or data are modified or deleted.

---

## Migration 1: `20260630-add-cheque-and-allocation-tables.js`
**Creates 2 new tables.**

### `cheques`
Decoupled cheque entity. One row per physical cheque received.

| Column | Type | Notes |
|---|---|---|
| Cheque_ID | INT PK AUTO | |
| Pay_ID | INT, nullable | FK → payment.Pay_ID |
| C_ID | INT, not null | FK → customer.C_ID |
| Cheque_No | VARCHAR(100) | Physical cheque number |
| Bank | VARCHAR(100) | Issuing bank |
| Branch | VARCHAR(100), nullable | Branch |
| Cheque_Date | DATE | Date on cheque |
| Amount | DECIMAL(10,2) | Cheque amount |
| Cheque_Status | ENUM | Pending / Cleared / Bounced / Expired |
| Cleared_Date | DATE, nullable | Set when cleared |
| Cleared_By | INT, nullable | User ID who cleared |
| Bounced_Date | DATETIME, nullable | Set when bounced |
| Bounced_By | INT, nullable | User ID who bounced |
| Bounced_Reason | TEXT, nullable | Reason for bounce |
| Notes | TEXT, nullable | Internal notes |
| Created_At | DATETIME | Auto |
| Updated_At | DATETIME | Auto |

### `payment_allocations`
FIFO allocation lines. Links a Payment (receipt) to one or more invoices.
System-generated — not user-facing.

| Column | Type | Notes |
|---|---|---|
| Alloc_ID | INT PK AUTO | |
| Pay_ID | INT, not null | FK → payment.Pay_ID |
| Sale_ID | INT, not null | FK → Sales.Sale_Id |
| Allocated_Amount | DECIMAL(10,2) | Amount applied to this invoice |
| Allocation_Type | ENUM | FIFO / Manual / Adjustment |
| Created_At | DATETIME | Auto |

---

## Migration 2: `20260630-add-void-audit-to-sales.js`
**Adds 3 nullable columns to the `Sales` table.**

All columns are nullable — existing rows are unaffected.

| Column | Type | Notes |
|---|---|---|
| Voided_By | INT, nullable | User ID who voided |
| Voided_At | DATETIME, nullable | Timestamp of void |
| Void_Reason | TEXT, nullable | Reason given |

---

## How to Run Migrations

> **Important:** The project uses Sequelize with `sequelize.sync({ alter: true })` in `server.js`.
> When the backend restarts, Sequelize will auto-apply model changes.
> **The migration files are reference/audit files only** — they can also be run manually with the Sequelize CLI.

### Option A — Auto (already happens on restart)
Just restart the backend server. The new `Cheque` and `PaymentAllocation` models will be synced automatically.

### Option B — Manual with Sequelize CLI
```bash
# From backend directory
npx sequelize-cli db:migrate
```

---

## Rollback

```bash
# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo specific migration
npx sequelize-cli db:migrate:undo --name 20260630-add-void-audit-to-sales.js
```

---

## Models Updated
- `models/index.js` — imports Cheque, PaymentAllocation
- `models/sales/SaleAssociation.js` — adds Cheque ↔ Payment, Cheque ↔ Customer, PaymentAllocation ↔ Payment, PaymentAllocation ↔ Sale

## No Data Loss Guarantee
- All new columns are `nullable`
- New tables are created fresh (no existing tables affected)
- The `voidSaleWithAudit` function only updates a row already in the `Sales` table, setting `Status = 'Void'` — same as the existing `voidSale` function
