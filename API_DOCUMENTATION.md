# PMS API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **admin**: Full system access
- **manager**: Manage properties, units, tenants, contracts
- **owner**: Manage own properties and units
- **tenant**: View own data, create tickets

---

## Authentication Endpoints

### POST /auth/register
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin|manager|owner|tenant",
  "first_name": "string",
  "last_name": "string"
}
```

### POST /auth/login
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

### GET /auth/me
Get current user profile (Protected)

### PUT /auth/updatedetails
Update user details (Protected)

### PUT /auth/updatepassword
Update password (Protected)

### GET /auth/logout
Logout user (Protected)

---

## Property Management

### GET /properties
Get all properties (Protected)
- Query params: `page`, `limit`, `city`, `country`, `search`

### POST /properties
Create property (Admin/Manager)
```json
{
  "property_number": "string",
  "address_line1": "string",
  "address_line2": "string",
  "city": "string",
  "state_province": "string",
  "postal_code": "string",
  "country": "string",
  "plot_size_sqm": "number",
  "total_units": "number",
  "description": "string"
}
```

### GET /properties/:id
Get single property (Protected)

### PUT /properties/:id
Update property (Admin/Manager)

### DELETE /properties/:id
Delete property (Admin)

### GET /properties/:id/units
Get property units (Protected)

### GET /properties/:id/statistics
Get property statistics (Protected)

---

## Unit Management

### GET /units
Get all units (Protected)
- Query params: `page`, `limit`, `property_id`, `unit_type`, `current_status`, `search`

### POST /units
Create unit (Admin/Manager)
```json
{
  "property_id": "string",
  "unit_number": "string",
  "unit_type": "Residential|Commercial|Retail",
  "num_bedrooms": "number",
  "num_bathrooms": "number",
  "area_sqm": "number",
  "current_status": "For Sale|For Rent|For Lease|Occupied|Vacant|Maintenance",
  "description": "string"
}
```

### GET /units/:id
Get single unit (Protected)

### PUT /units/:id
Update unit (Admin/Manager)

### DELETE /units/:id
Delete unit (Admin)

### GET /units/:id/details
Get unit with related data (Protected)

### PUT /units/:id/status
Update unit status (Admin/Manager)

---

## Owner Management

### GET /owners
Get all owners (Protected)
- Query params: `page`, `limit`, `owner_type`, `search`

### POST /owners
Create owner (Admin/Manager)
```json
{
  "owner_type": "Individual|Company|Bank|RealEstateAgent",
  "name": "string",
  "contact_person": "string",
  "email": "string",
  "phone_number": "string",
  "address": "string",
  "id_document_info": "string"
}
```

### GET /owners/:id
Get single owner (Protected)

### PUT /owners/:id
Update owner (Admin/Manager)

### DELETE /owners/:id
Delete owner (Admin)

### GET /owners/:id/properties
Get owner properties (Protected)

### GET /owners/:id/units
Get owner units (Protected)

### GET /owners/:id/contracts
Get owner contracts (Protected)

### GET /owners/:id/financial-summary
Get owner financial summary (Protected)

---

## Tenant Management

### GET /tenants
Get all tenants (Protected)
- Query params: `page`, `limit`, `nationality`, `search`

### POST /tenants
Create tenant (Admin/Manager)
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "string",
  "nationality": "string",
  "id_document_type": "National ID|Passport|Driver License",
  "id_document_number": "string",
  "date_of_birth": "date",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "notes": "string"
}
```

### GET /tenants/:id
Get single tenant (Protected)

### PUT /tenants/:id
Update tenant (Admin/Manager)

### DELETE /tenants/:id
Delete tenant (Admin)

### GET /tenants/:id/contracts
Get tenant contracts (Protected)

### GET /tenants/:id/active-contracts
Get tenant active contracts (Protected)

### GET /tenants/:id/payments
Get tenant payments (Protected)

### GET /tenants/:id/tickets
Get tenant tickets (Protected)

---

## Contract Management

### GET /contracts
Get all contracts (Protected)
- Query params: `page`, `limit`, `contract_status`, `contract_type`, `unit_id`, `tenant_id`

### POST /contracts
Create contract (Admin/Manager)
```json
{
  "unit_id": "string",
  "tenant_id": "string",
  "owner_id": "string",
  "contract_type": "Rental|Lease",
  "start_date": "date",
  "end_date": "date",
  "duration_years": "number",
  "monthly_rent_amount": "number",
  "currency": "string",
  "payment_frequency": "Monthly|Quarterly|Semi-Annually|Annually",
  "grace_period_days": "number",
  "default_payment_day_of_month": "number",
  "contract_status": "Active|Expired|Terminated|Pending",
  "signed_date": "date"
}
```

### GET /contracts/:id
Get single contract (Protected)

### PUT /contracts/:id
Update contract (Admin/Manager)

### DELETE /contracts/:id
Delete contract (Admin)

### GET /contracts/:id/details
Get contract details (Protected)

### GET /contracts/:id/invoices
Get contract invoices (Protected)

### GET /contracts/:id/payments
Get contract payments (Protected)

### PUT /contracts/:id/status
Update contract status (Admin/Manager)

### POST /contracts/:id/renew
Renew contract (Admin/Manager)

---

## Payment Management

### GET /payments
Get all payments (Protected)
- Query params: `page`, `limit`, `tenant_id`, `payment_method`, `contract_id`, `date_from`, `date_to`

### POST /payments
Create payment (Admin/Manager)
```json
{
  "invoice_id": "string",
  "contract_id": "string",
  "tenant_id": "string",
  "payment_date": "date",
  "payment_amount": "number",
  "currency": "string",
  "payment_method": "Bank Transfer|Cheque|Cash|Credit Card|Online",
  "transaction_reference": "string",
  "is_advance_payment": "boolean"
}
```

### GET /payments/:id
Get single payment (Protected)

### PUT /payments/:id
Update payment (Admin/Manager)

### DELETE /payments/:id
Delete payment (Admin)

### GET /payments/:id/details
Get payment details (Protected)

### GET /payments/tenant/:tenantId/stats
Get tenant payment statistics (Protected)

### GET /payments/monthly-summary
Get monthly payment summary (Admin/Manager)

### POST /payments/:id/refund
Process refund (Admin)

---

## Invoice Management

### GET /invoices
Get all invoices (Protected)
- Query params: `page`, `limit`, `invoice_status`, `tenant_id`, `contract_id`, `overdue`

### POST /invoices
Create invoice (Admin/Manager)
```json
{
  "contract_id": "string",
  "unit_id": "string",
  "tenant_id": "string",
  "invoice_date": "date",
  "due_date": "date",
  "billing_period_start": "date",
  "billing_period_end": "date",
  "total_amount": "number",
  "currency": "string"
}
```

### GET /invoices/:id
Get single invoice (Protected)

### GET /invoices/number/:invoiceNumber
Get invoice by number (Protected)

### PUT /invoices/:id
Update invoice (Admin/Manager)

### DELETE /invoices/:id
Delete invoice (Admin)

### GET /invoices/:id/details
Get invoice details (Protected)

### GET /invoices/:id/payments
Get invoice payments (Protected)

### PUT /invoices/:id/mark-paid
Mark invoice as paid (Admin/Manager)

### PUT /invoices/:id/status
Update invoice status (Admin/Manager)

### POST /invoices/generate-recurring/:contractId
Generate recurring invoices (Admin/Manager)

---

## Health Check

### GET /health
Check API health status

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "count": 10,
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
