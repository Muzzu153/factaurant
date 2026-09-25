---

### File 2: `docs/02-modules/admin.md`

Create this file in your project:

```markdown
# Module Specification: Admin & Operations

## 1. The What (Domain Purpose)
The `admin` module provides operational capabilities for store managers:
1. Reviewing incoming customer orders in real time.
2. Creating and publishing new menu items with image uploads.

---

## 2. The Why (Architectural Rationale)
Administrative actions require high security and strict tenant boundaries. Isolating admin logic into its own vertical slice (`src/modules/admin/`) ensures that operational workflows remain decoupled from public customer-facing browsing (`menu`) and ordering (`cart`).

---

## 3. The How (Execution & Contracts)

### A. Schemas (`admin.schema.ts`)
- `GetPresignedUrlSchema`: Validates file metadata before generating cloud upload tickets.
- `CreateProductSchema`: Validates product creation payloads (enforcing integer cents for prices and valid public image URLs).

### B. Server RPC Functions (`admin.server.ts`)
- `getAdminOrders`: Calls `adminService.getRecentOrders(context.db)` to fetch orders ordered by creation date.
- `getPresignedUploadUrl`: Validates file parameters and calls `adminService.generateUploadUrl(context.tenantId, data)`.
- `createProduct`: Validates product fields and calls `adminService.createProduct(context.db, data)`.

### C. UI Components (`src/modules/admin/ui/`)
- `<AddProductForm />`: Handles client-side file selection, zero-latency local preview (`URL.createObjectURL`), presigned R2 upload, and product creation.
- `<OrderTable />`: Renders customer details, addresses, itemized receipts, and order status badges.

---

## 4. The Dos and Don'ts

- ✅ **DO:** Convert dollar inputs to integer cents on the client (`Math.round(dollars * 100)`) before calling `createProduct`.
- ✅ **DO:** Use `context.db.products.create()` so the `tenantId` is automatically applied by the repository layer.
- ❌ **DO NOT:** Pass raw image byte streams through server functions.
- ❌ **DO NOT:** Query orders across all tenants without the `tenantFn` security boundary.

---

## 5. Failure Modes & Resilience
- **Storage Upload Failure:** If Cloudflare R2 is unreachable or CORS fails, `<AddProductForm />` catches the exception, halts the database write, and displays a user-friendly error message without corrupting PostgreSQL.
- **Form Reset:** Upon successful product creation, the form clears all local state and triggers a layout refresh.