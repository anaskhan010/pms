import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const createFinancialTables = async () => {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pms'
    });

    console.log('Connected to MySQL database');

    // Create FinancialTransactions table
    const createFinancialTransactionsTable = `
      CREATE TABLE IF NOT EXISTS FinancialTransactions (
        transactionId varchar(36) NOT NULL,
        tenantId int DEFAULT NULL,
        apartmentId int DEFAULT NULL,
        contractId int DEFAULT NULL,
        transactionType enum('Rent Payment','Security Deposit','Maintenance Fee','Utility Payment','Late Fee','Refund','Other') NOT NULL,
        amount decimal(10,2) NOT NULL,
        currency varchar(3) NOT NULL DEFAULT 'AED',
        paymentMethod enum('Bank Transfer','Credit Card','Cash','Cheque','Online Payment') NOT NULL,
        transactionDate date NOT NULL,
        dueDate date DEFAULT NULL,
        status enum('Pending','Completed','Failed','Cancelled','Refunded') NOT NULL DEFAULT 'Pending',
        description text,
        referenceNumber varchar(100) DEFAULT NULL,
        receiptPath varchar(500) DEFAULT NULL,
        processingFee decimal(8,2) DEFAULT 0.00,
        lateFee decimal(8,2) DEFAULT 0.00,
        billingPeriodStart date DEFAULT NULL,
        billingPeriodEnd date DEFAULT NULL,
        createdBy int DEFAULT NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (transactionId),
        KEY idx_tenant_id (tenantId),
        KEY idx_apartment_id (apartmentId),
        KEY idx_contract_id (contractId),
        KEY idx_transaction_date (transactionDate),
        KEY idx_status (status),
        KEY idx_transaction_type (transactionType)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    await connection.execute(createFinancialTransactionsTable);
    console.log('✓ FinancialTransactions table created successfully');

    // Create PaymentSchedule table
    const createPaymentScheduleTable = `
      CREATE TABLE IF NOT EXISTS PaymentSchedule (
        scheduleId int NOT NULL AUTO_INCREMENT,
        contractId int NOT NULL,
        tenantId int NOT NULL,
        apartmentId int NOT NULL,
        paymentType enum('Monthly Rent','Quarterly Rent','Yearly Rent','Security Deposit') NOT NULL,
        amount decimal(10,2) NOT NULL,
        dueDate date NOT NULL,
        status enum('Pending','Paid','Overdue','Cancelled') NOT NULL DEFAULT 'Pending',
        transactionId varchar(36) DEFAULT NULL,
        generatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (scheduleId),
        KEY idx_contract_id (contractId),
        KEY idx_tenant_id (tenantId),
        KEY idx_apartment_id (apartmentId),
        KEY idx_due_date (dueDate),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    await connection.execute(createPaymentScheduleTable);
    console.log('✓ PaymentSchedule table created successfully');

    // Create TenantPaymentHistory table
    const createTenantPaymentHistoryTable = `
      CREATE TABLE IF NOT EXISTS TenantPaymentHistory (
        paymentHistoryId int NOT NULL AUTO_INCREMENT,
        tenantId int NOT NULL,
        apartmentId int NOT NULL,
        contractId int NOT NULL,
        transactionId varchar(36) NOT NULL,
        paymentMonth date NOT NULL,
        rentAmount decimal(10,2) NOT NULL,
        lateFee decimal(8,2) DEFAULT 0.00,
        totalPaid decimal(10,2) NOT NULL,
        paymentDate date NOT NULL,
        paymentMethod enum('Bank Transfer','Credit Card','Cash','Cheque','Online Payment') NOT NULL,
        status enum('On Time','Late','Partial','Failed') NOT NULL,
        notes text,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (paymentHistoryId),
        KEY idx_tenant_id (tenantId),
        KEY idx_apartment_id (apartmentId),
        KEY idx_contract_id (contractId),
        KEY idx_payment_month (paymentMonth),
        KEY idx_payment_date (paymentDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    await connection.execute(createTenantPaymentHistoryTable);
    console.log('✓ TenantPaymentHistory table created successfully');

    // Add foreign key constraints
    const addConstraints = [
      `ALTER TABLE FinancialTransactions 
       ADD CONSTRAINT fk_financial_tenant FOREIGN KEY (tenantId) REFERENCES tenant (tenantId) ON DELETE SET NULL,
       ADD CONSTRAINT fk_financial_apartment FOREIGN KEY (apartmentId) REFERENCES apartment (apartmentId) ON DELETE SET NULL,
       ADD CONSTRAINT fk_financial_contract FOREIGN KEY (contractId) REFERENCES Contract (contractId) ON DELETE SET NULL,
       ADD CONSTRAINT fk_financial_created_by FOREIGN KEY (createdBy) REFERENCES user (userId) ON DELETE SET NULL`,
      
      `ALTER TABLE PaymentSchedule
       ADD CONSTRAINT fk_schedule_contract FOREIGN KEY (contractId) REFERENCES Contract (contractId) ON DELETE CASCADE,
       ADD CONSTRAINT fk_schedule_tenant FOREIGN KEY (tenantId) REFERENCES tenant (tenantId) ON DELETE CASCADE,
       ADD CONSTRAINT fk_schedule_apartment FOREIGN KEY (apartmentId) REFERENCES apartment (apartmentId) ON DELETE CASCADE,
       ADD CONSTRAINT fk_schedule_transaction FOREIGN KEY (transactionId) REFERENCES FinancialTransactions (transactionId) ON DELETE SET NULL`,
      
      `ALTER TABLE TenantPaymentHistory
       ADD CONSTRAINT fk_payment_history_tenant FOREIGN KEY (tenantId) REFERENCES tenant (tenantId) ON DELETE CASCADE,
       ADD CONSTRAINT fk_payment_history_apartment FOREIGN KEY (apartmentId) REFERENCES apartment (apartmentId) ON DELETE CASCADE,
       ADD CONSTRAINT fk_payment_history_contract FOREIGN KEY (contractId) REFERENCES Contract (contractId) ON DELETE CASCADE,
       ADD CONSTRAINT fk_payment_history_transaction FOREIGN KEY (transactionId) REFERENCES FinancialTransactions (transactionId) ON DELETE CASCADE`
    ];

    for (const constraint of addConstraints) {
      try {
        await connection.execute(constraint);
        console.log('✓ Foreign key constraints added successfully');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠ Foreign key constraints already exist, skipping...');
        } else {
          console.error('Error adding constraints:', error.message);
        }
      }
    }

    console.log('\n🎉 Financial transaction tables created successfully!');
    console.log('\nTables created:');
    console.log('- FinancialTransactions: Main transaction records');
    console.log('- PaymentSchedule: Automated payment scheduling');
    console.log('- TenantPaymentHistory: Tenant payment tracking');

  } catch (error) {
    console.error('Error creating financial tables:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
};

// Run the script
createFinancialTables();
