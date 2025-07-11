const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Invoice {
  constructor(invoiceData) {
    this.invoice_id = invoiceData.invoice_id;
    this.contract_id = invoiceData.contract_id;
    this.unit_id = invoiceData.unit_id;
    this.tenant_id = invoiceData.tenant_id;
    this.invoice_number = invoiceData.invoice_number;
    this.invoice_date = invoiceData.invoice_date;
    this.due_date = invoiceData.due_date;
    this.billing_period_start = invoiceData.billing_period_start;
    this.billing_period_end = invoiceData.billing_period_end;
    this.total_amount = invoiceData.total_amount;
    this.amount_due = invoiceData.amount_due;
    this.currency = invoiceData.currency;
    this.invoice_status = invoiceData.invoice_status;
    this.generated_at = invoiceData.generated_at;
  }

  static async create(invoiceData) {
    const invoiceId = uuidv4();
    const invoiceNumber = await Invoice.generateInvoiceNumber();
    
    const sql = `
      INSERT INTO Invoices (
        invoice_id, contract_id, unit_id, tenant_id, invoice_number, invoice_date,
        due_date, billing_period_start, billing_period_end, total_amount,
        amount_due, currency, invoice_status, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
      invoiceId,
      invoiceData.contract_id || null,
      invoiceData.unit_id,
      invoiceData.tenant_id,
      invoiceNumber,
      invoiceData.invoice_date,
      invoiceData.due_date,
      invoiceData.billing_period_start || null,
      invoiceData.billing_period_end || null,
      invoiceData.total_amount,
      invoiceData.amount_due || invoiceData.total_amount,
      invoiceData.currency,
      invoiceData.invoice_status || 'Generated'
    ];

    await db.query(sql, values);
    return await Invoice.findById(invoiceId);
  }

  static async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const sql = `
      SELECT COUNT(*) as count 
      FROM Invoices 
      WHERE invoice_number LIKE ?
    `;
    
    const [result] = await db.query(sql, [`INV-${year}${month}-%`]);
    const sequence = String(result.count + 1).padStart(4, '0');
    
    return `INV-${year}${month}-${sequence}`;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM Invoices WHERE invoice_id = ?';
    const [invoice] = await db.query(sql, [id]);
    return invoice ? new Invoice(invoice) : null;
  }

  static async findByNumber(invoiceNumber) {
    const sql = 'SELECT * FROM Invoices WHERE invoice_number = ?';
    const [invoice] = await db.query(sql, [invoiceNumber]);
    return invoice ? new Invoice(invoice) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT i.*, t.first_name, t.last_name, u.unit_number, p.property_number
      FROM Invoices i
      INNER JOIN Tenants t ON i.tenant_id = t.tenant_id
      INNER JOIN Units u ON i.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      WHERE 1=1
    `;
    let countSql = 'SELECT COUNT(*) as total FROM Invoices WHERE 1=1';
    const values = [];

    if (filters.invoice_status) {
      sql += ' AND i.invoice_status = ?';
      countSql += ' AND invoice_status = ?';
      values.push(filters.invoice_status);
    }

    if (filters.tenant_id) {
      sql += ' AND i.tenant_id = ?';
      countSql += ' AND tenant_id = ?';
      values.push(filters.tenant_id);
    }

    if (filters.contract_id) {
      sql += ' AND i.contract_id = ?';
      countSql += ' AND contract_id = ?';
      values.push(filters.contract_id);
    }

    if (filters.overdue) {
      sql += ' AND i.due_date < CURDATE() AND i.invoice_status NOT IN ("Paid", "Cancelled")';
      countSql += ' AND due_date < CURDATE() AND invoice_status NOT IN ("Paid", "Cancelled")';
    }

    sql += ' ORDER BY i.generated_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const invoices = await db.query(sql, values);

    return {
      invoices: invoices.map(invoice => new Invoice(invoice)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  async update(updateData) {
    const allowedFields = [
      'invoice_date', 'due_date', 'billing_period_start', 'billing_period_end',
      'total_amount', 'amount_due', 'currency', 'invoice_status'
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.invoice_id);

    const sql = `UPDATE Invoices SET ${updates.join(', ')} WHERE invoice_id = ?`;
    await db.query(sql, values);

    return await Invoice.findById(this.invoice_id);
  }

  async delete() {
    const sql = 'DELETE FROM Invoices WHERE invoice_id = ?';
    await db.query(sql, [this.invoice_id]);
  }

  async getDetails() {
    const sql = `
      SELECT 
        i.*,
        t.first_name, t.last_name, t.email as tenant_email, t.phone_number as tenant_phone,
        u.unit_number, u.unit_type,
        p.property_number, p.address_line1, p.city,
        c.monthly_rent_amount, c.contract_type,
        o.name as owner_name, o.email as owner_email
      FROM Invoices i
      INNER JOIN Tenants t ON i.tenant_id = t.tenant_id
      INNER JOIN Units u ON i.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      LEFT JOIN Contracts c ON i.contract_id = c.contract_id
      LEFT JOIN Owners o ON c.owner_id = o.owner_id
      WHERE i.invoice_id = ?
    `;
    
    const [details] = await db.query(sql, [this.invoice_id]);
    return details;
  }

  async getPayments() {
    const sql = `
      SELECT * FROM Payments 
      WHERE invoice_id = ? 
      ORDER BY recorded_at DESC
    `;
    const payments = await db.query(sql, [this.invoice_id]);
    return payments;
  }

  async markAsPaid(paymentAmount = null) {
    const amountPaid = paymentAmount || this.total_amount;
    const newStatus = amountPaid >= this.total_amount ? 'Paid' : 'Partially Paid';
    const newAmountDue = Math.max(0, this.total_amount - amountPaid);

    return await this.update({
      invoice_status: newStatus,
      amount_due: newAmountDue
    });
  }

  isOverdue() {
    if (this.invoice_status === 'Paid' || this.invoice_status === 'Cancelled') {
      return false;
    }
    return new Date(this.due_date) < new Date();
  }

  getDaysOverdue() {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static async generateRecurringInvoices(contractId, months = 12) {
    const sql = `
      SELECT c.*, u.unit_id, t.tenant_id
      FROM Contracts c
      INNER JOIN Units u ON c.unit_id = u.unit_id
      INNER JOIN Tenants t ON c.tenant_id = t.tenant_id
      WHERE c.contract_id = ? AND c.contract_status = 'Active'
    `;
    
    const [contract] = await db.query(sql, [contractId]);
    if (!contract) throw new Error('Contract not found or not active');

    const invoices = [];
    const startDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const invoiceDate = new Date(startDate);
      invoiceDate.setMonth(startDate.getMonth() + i);
      
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(contract.default_payment_day_of_month);
      if (dueDate <= invoiceDate) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const billingStart = new Date(invoiceDate);
      billingStart.setDate(1);
      
      const billingEnd = new Date(billingStart);
      billingEnd.setMonth(billingEnd.getMonth() + 1);
      billingEnd.setDate(0);

      const invoiceData = {
        contract_id: contractId,
        unit_id: contract.unit_id,
        tenant_id: contract.tenant_id,
        invoice_date: invoiceDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        billing_period_start: billingStart.toISOString().split('T')[0],
        billing_period_end: billingEnd.toISOString().split('T')[0],
        total_amount: contract.monthly_rent_amount,
        currency: contract.currency
      };

      const invoice = await Invoice.create(invoiceData);
      invoices.push(invoice);
    }

    return invoices;
  }
}

module.exports = Invoice;
