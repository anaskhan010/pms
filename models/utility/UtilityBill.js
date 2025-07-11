const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class UtilityBill {
  constructor(billData) {
    this.utility_bill_id = billData.utility_bill_id;
    this.unit_meter_id = billData.unit_meter_id;
    this.utility_type_id = billData.utility_type_id;
    this.unit_id = billData.unit_id;
    this.tenant_id = billData.tenant_id;
    this.owner_id = billData.owner_id;
    this.bill_date = billData.bill_date;
    this.due_date = billData.due_date;
    this.reading_start_date = billData.reading_start_date;
    this.reading_end_date = billData.reading_end_date;
    this.previous_reading = billData.previous_reading;
    this.current_reading = billData.current_reading;
    this.consumption = billData.consumption;
    this.amount = billData.amount;
    this.currency = billData.currency;
    this.bill_status = billData.bill_status;
    this.invoice_link = billData.invoice_link;
    this.created_at = billData.created_at;
    this.updated_at = billData.updated_at;
  }

  static async create(billData) {
    const billId = uuidv4();
    
    let consumption = billData.consumption;
    if (!consumption && billData.current_reading && billData.previous_reading) {
      consumption = billData.current_reading - billData.previous_reading;
    }

    const sql = `
      INSERT INTO UtilityBills (
        utility_bill_id, unit_meter_id, utility_type_id, unit_id, tenant_id,
        owner_id, bill_date, due_date, reading_start_date, reading_end_date,
        previous_reading, current_reading, consumption, amount, currency,
        bill_status, invoice_link, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      billId,
      billData.unit_meter_id || null,
      billData.utility_type_id,
      billData.unit_id,
      billData.tenant_id || null,
      billData.owner_id || null,
      billData.bill_date,
      billData.due_date,
      billData.reading_start_date || null,
      billData.reading_end_date || null,
      billData.previous_reading || null,
      billData.current_reading || null,
      consumption || null,
      billData.amount,
      billData.currency,
      billData.bill_status || 'Unpaid',
      billData.invoice_link || null
    ];

    await db.query(sql, values);
    return await UtilityBill.findById(billId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM UtilityBills WHERE utility_bill_id = ?';
    const [bill] = await db.query(sql, [id]);
    return bill ? new UtilityBill(bill) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT ub.*, u.unit_number, p.property_number, ut.utility_name,
             t.first_name, t.last_name, o.name as owner_name
      FROM UtilityBills ub
      INNER JOIN Units u ON ub.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      INNER JOIN Utilities ut ON ub.utility_type_id = ut.utility_type_id
      LEFT JOIN Tenants t ON ub.tenant_id = t.tenant_id
      LEFT JOIN Owners o ON ub.owner_id = o.owner_id
      WHERE 1=1
    `;
    let countSql = 'SELECT COUNT(*) as total FROM UtilityBills WHERE 1=1';
    const values = [];

    if (filters.utility_type_id) {
      sql += ' AND ub.utility_type_id = ?';
      countSql += ' AND utility_type_id = ?';
      values.push(filters.utility_type_id);
    }

    if (filters.unit_id) {
      sql += ' AND ub.unit_id = ?';
      countSql += ' AND unit_id = ?';
      values.push(filters.unit_id);
    }

    if (filters.tenant_id) {
      sql += ' AND ub.tenant_id = ?';
      countSql += ' AND tenant_id = ?';
      values.push(filters.tenant_id);
    }

    if (filters.bill_status) {
      sql += ' AND ub.bill_status = ?';
      countSql += ' AND bill_status = ?';
      values.push(filters.bill_status);
    }

    if (filters.overdue) {
      sql += ' AND ub.due_date < CURDATE() AND ub.bill_status = "Unpaid"';
      countSql += ' AND due_date < CURDATE() AND bill_status = "Unpaid"';
    }

    sql += ' ORDER BY ub.created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const bills = await db.query(sql, values);

    return {
      bills: bills.map(bill => new UtilityBill(bill)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  async update(updateData) {
    const allowedFields = [
      'bill_date', 'due_date', 'reading_start_date', 'reading_end_date',
      'previous_reading', 'current_reading', 'consumption', 'amount',
      'currency', 'bill_status', 'invoice_link'
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

    if (updateData.current_reading || updateData.previous_reading) {
      const currentBill = await UtilityBill.findById(this.utility_bill_id);
      const currentReading = updateData.current_reading || currentBill.current_reading;
      const previousReading = updateData.previous_reading || currentBill.previous_reading;
      
      if (currentReading && previousReading) {
        const consumption = currentReading - previousReading;
        updates.push('consumption = ?');
        values.push(consumption);
      }
    }

    updates.push('updated_at = NOW()');
    values.push(this.utility_bill_id);

    const sql = `UPDATE UtilityBills SET ${updates.join(', ')} WHERE utility_bill_id = ?`;
    await db.query(sql, values);

    return await UtilityBill.findById(this.utility_bill_id);
  }

  async delete() {
    const sql = 'DELETE FROM UtilityBills WHERE utility_bill_id = ?';
    await db.query(sql, [this.utility_bill_id]);
  }

  async getDetails() {
    const sql = `
      SELECT 
        ub.*,
        u.unit_number, u.unit_type,
        p.property_number, p.address_line1, p.city,
        ut.utility_name, ut.is_metered, ut.base_charge,
        t.first_name, t.last_name, t.email as tenant_email,
        o.name as owner_name, o.email as owner_email,
        uum.meter_number
      FROM UtilityBills ub
      INNER JOIN Units u ON ub.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      INNER JOIN Utilities ut ON ub.utility_type_id = ut.utility_type_id
      LEFT JOIN Tenants t ON ub.tenant_id = t.tenant_id
      LEFT JOIN Owners o ON ub.owner_id = o.owner_id
      LEFT JOIN UnitUtilityMeters uum ON ub.unit_meter_id = uum.unit_meter_id
      WHERE ub.utility_bill_id = ?
    `;
    
    const [details] = await db.query(sql, [this.utility_bill_id]);
    return details;
  }

  async markAsPaid() {
    return await this.update({ bill_status: 'Paid' });
  }

  async markAsOverdue() {
    return await this.update({ bill_status: 'Overdue' });
  }

  isOverdue() {
    if (this.bill_status === 'Paid') return false;
    return new Date(this.due_date) < new Date();
  }

  getDaysOverdue() {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static async generateMonthlyBills(utilityTypeId, billDate, dueDate) {
    const sql = `
      SELECT uum.*, u.unit_id, uo.owner_id, c.tenant_id, ut.base_charge
      FROM UnitUtilityMeters uum
      INNER JOIN Units u ON uum.unit_id = u.unit_id
      INNER JOIN Utilities ut ON uum.utility_type_id = ut.utility_type_id
      LEFT JOIN UnitOwnership uo ON u.unit_id = uo.unit_id AND uo.is_current = true
      LEFT JOIN Contracts c ON u.unit_id = c.unit_id AND c.contract_status = 'Active'
      WHERE uum.utility_type_id = ? AND uum.is_active = true
    `;
    
    const meters = await db.query(sql, [utilityTypeId]);
    const bills = [];

    for (const meter of meters) {
      const previousBillSql = `
        SELECT current_reading 
        FROM UtilityBills 
        WHERE unit_meter_id = ? 
        ORDER BY bill_date DESC 
        LIMIT 1
      `;
      const [previousBill] = await db.query(previousBillSql, [meter.unit_meter_id]);
      const previousReading = previousBill ? previousBill.current_reading : 0;

      const billData = {
        unit_meter_id: meter.unit_meter_id,
        utility_type_id: utilityTypeId,
        unit_id: meter.unit_id,
        tenant_id: meter.tenant_id,
        owner_id: meter.owner_id,
        bill_date: billDate,
        due_date: dueDate,
        previous_reading: previousReading,
        current_reading: previousReading,
        consumption: 0,
        amount: meter.base_charge || 0,
        currency: 'AED'
      };

      const bill = await UtilityBill.create(billData);
      bills.push(bill);
    }

    return bills;
  }

  async updateReading(currentReading, ratePerUnit = 0) {
    const consumption = currentReading - (this.previous_reading || 0);
    const amount = (this.base_charge || 0) + (consumption * ratePerUnit);

    return await this.update({
      current_reading: currentReading,
      consumption: consumption,
      amount: amount
    });
  }

  static async getUnitConsumptionHistory(unitId, utilityTypeId, months = 12) {
    const sql = `
      SELECT 
        bill_date,
        consumption,
        amount,
        previous_reading,
        current_reading
      FROM UtilityBills 
      WHERE unit_id = ? AND utility_type_id = ?
      ORDER BY bill_date DESC 
      LIMIT ?
    `;
    
    const history = await db.query(sql, [unitId, utilityTypeId, months]);
    return history;
  }
}

module.exports = UtilityBill;
