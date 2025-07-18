
import db from '../../config/db.js';
import userModel from '../user/User.js';
import bcrypt from 'bcryptjs';
import PaymentSchedule from '../financial/PaymentSchedule.js';

const createTenant = async (tenantData) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      firstName, lastName, email, password, phoneNumber, address,
      gender, nationality, dateOfBirth, image, registrationNumber,
      registrationExpiry, occupation, ejariPdfPath, apartmentId,
      contractStartDate, contractEndDate, securityFee
    } = tenantData;

    // 1. Create user account (without role assignment)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user directly without role assignment
    const userQuery = `INSERT INTO user (
      firstName, lastName, email, password, phoneNumber,
      address, gender, nationality, dateOfBirth, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const userValues = [
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      address,
      gender,
      nationality,
      dateOfBirth,
      image || ''
    ];

    console.log('Creating user for tenant...');
    const userResult = await connection.execute(userQuery, userValues);
    const userId = userResult[0].insertId;
    console.log('User created with ID:', userId);

    const user = { userId, email };

    // 2. Create tenant record
    const tenantQuery = `
      INSERT INTO tenant (
        userId, registrationNumber, registrationExpiry, occupation, ejariPdfPath
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const tenantValues = [
      user.userId,
      registrationNumber || null,
      registrationExpiry || null,
      occupation || null,
      ejariPdfPath || null
    ];

    const tenantResult = await connection.execute(tenantQuery, tenantValues);
    const tenantId = tenantResult[0].insertId;

    // 3. Assign apartment if provided
    if (apartmentId) {
      // Convert apartmentId to number to ensure proper data type
      const apartmentIdNum = parseInt(apartmentId);

      const apartmentAssignQuery = `
        INSERT INTO ApartmentAssigned (tenantId, apartmentId)
        VALUES (?, ?)
      `;
      await connection.execute(apartmentAssignQuery, [tenantId, apartmentIdNum]);

      // Update apartment status to 'Rented'
      const statusUpdateQuery = 'UPDATE apartment SET status = ? WHERE apartmentId = ?';
      await connection.execute(statusUpdateQuery, ['Rented', apartmentIdNum]);
    }

    // 4. Create contract if contract details provided
    if (contractStartDate && contractEndDate) {
      const contractQuery = `
        INSERT INTO Contract (SecurityFee, tenantId, startDate, endDate)
        VALUES (?, ?, ?, ?)
      `;

      // Use proper DATE format (YYYY-MM-DD)
      const contractValues = [
        securityFee || 0,
        tenantId,
        contractStartDate, // Now expects DATE format
        contractEndDate    // Now expects DATE format
      ];

      const contractResult = await connection.execute(contractQuery, contractValues);
      const contractId = contractResult[0].insertId;

      // 5. Create contract details if apartment is assigned
      if (apartmentId && contractId) {
        const apartmentIdNum = parseInt(apartmentId);
        const contractDetailsQuery = `
          INSERT INTO ContractDetails (contractId, apartmentId)
          VALUES (?, ?)
        `;
        await connection.execute(contractDetailsQuery, [contractId, apartmentIdNum]);
      }
    }

    await connection.commit();

    // Return the complete tenant data
    return await getTenantById(tenantId);

  } catch (error) {
    await connection.rollback();
    console.error('Error in createTenant:', error);
    throw error;
  } finally {
    connection.release();
  }
};


const getTenantCount = async () => {
  const query = 'SELECT COUNT(*) as total FROM tenant';
  const [result] = await db.execute(query);
  return result[0].total;
};

const getTenantById = async (tenantId) => {
  const query = `
    SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at,
           aa.apartmentId, a.bedrooms, a.bathrooms, a.rentPrice,
           f.floorName, b.buildingName, b.buildingAddress,
           c.contractId, c.SecurityFee,
           DATE_FORMAT(c.startDate, '%Y-%m-%d') as startDate,
           DATE_FORMAT(c.endDate, '%Y-%m-%d') as endDate
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN Contract c ON t.tenantId = c.tenantId
    WHERE t.tenantId = ?
  `;

  const [rows] = await db.execute(query, [tenantId]);
  return rows[0] || null;
};

const getTenantByUserId = async (userId) => {
  const query = `
    SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    WHERE t.userId = ?
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows[0] || null;
};

const getTenantByEmail = async (email) => {
  const query = `
    SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    WHERE u.email = ?
  `;

  const [rows] = await db.execute(query, [email]);
  return rows[0] || null;
};

const getAllTenants = async (page = 1, limit = 25, filters = {}) => {
  // Ensure page and limit are integers
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 25;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = `
      SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
             u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at,
             aa.apartmentId, a.bedrooms, a.bathrooms, a.rentPrice,
             f.floorName, b.buildingName, b.buildingAddress, b.buildingId
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE 1 = 1
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT t.tenantId) as total
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE 1 = 1
    `;

    const values = [];
    const countValues = [];

    // Apply ownership-based filtering for non-admin users
    if (filters.ownerBuildings !== undefined || filters.tenantIds !== undefined) {
      let ownershipConditions = [];

      // Filter by building ownership - show tenants in owner's buildings
      if (filters.ownerBuildings && filters.ownerBuildings.length > 0) {
        const placeholders = filters.ownerBuildings.map(() => '?').join(',');
        ownershipConditions.push(`(b.buildingId IN (${placeholders}) AND aa.apartmentId IS NOT NULL)`);
        values.push(...filters.ownerBuildings);
        countValues.push(...filters.ownerBuildings);
      }

      // Filter by direct tenant ownership - show tenants created by owner
      if (filters.tenantIds && filters.tenantIds.length > 0) {
        const placeholders = filters.tenantIds.map(() => '?').join(',');
        ownershipConditions.push(`t.tenantId IN (${placeholders})`);
        values.push(...filters.tenantIds);
        countValues.push(...filters.tenantIds);
      }

      // Apply ownership conditions
      if (ownershipConditions.length > 0) {
        const ownershipFilter = `(${ownershipConditions.join(' OR ')})`;
        query += ` AND ${ownershipFilter}`;
        countQuery += ` AND ${ownershipFilter}`;

        // Only exclude orphan tenants for direct tenant ownership, not building-based access
        // Building-assigned owners should see ALL tenants in their buildings
        if (filters.tenantIds && filters.tenantIds.length > 0 && (!filters.ownerBuildings || filters.ownerBuildings.length === 0)) {
          query += ' AND t.createdBy IS NOT NULL';
          countQuery += ' AND t.createdBy IS NOT NULL';
        }
      } else {
        // Owner has no buildings and no tenants - show empty result
        query += ` AND 1 = 0`;
        countQuery += ` AND 1 = 0`;
      }
    }

    query += ` ORDER BY u.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log('Executing getAllTenants with limit:', limitNum, 'offset:', offset);
    console.log('Query:', query);
    console.log('Values:', values);

    const [totalResult] = await db.execute(countQuery, countValues);
    const [tenants] = await db.execute(query, values);

    console.log('Query results - Total:', totalResult[0].total, 'Tenants:', tenants.length);

    return {
      tenants,
      total: totalResult[0].total,
      page: pageNum,
      pages: Math.ceil(totalResult[0].total / limitNum)
    };
  } catch (error) {
    console.error('Error in getAllTenants:', error);
    throw error;
  }
};

const updateTenant = async (tenantId, updateData, apartmentAssignmentData = null) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'gender', 'nationality', 'dateOfBirth', 'image'];
    const tenantFields = ['registrationNumber', 'registrationExpiry', 'occupation'];

    const userUpdates = {};
    const tenantUpdates = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (userFields.includes(key) && value !== undefined) {
        userUpdates[key] = value;
      } else if (tenantFields.includes(key) && value !== undefined) {
        tenantUpdates[key] = value;
      }
    }

    if (Object.keys(userUpdates).length > 0) {
      await userModel.updateUser(tenant.userId, userUpdates);
    }

    if (Object.keys(tenantUpdates).length > 0) {
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(tenantUpdates)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }

      values.push(tenantId);
      const query = `UPDATE tenant SET ${updates.join(', ')} WHERE tenantId = ?`;
      await connection.execute(query, values);
    }

    // Handle apartment assignment changes
    if (apartmentAssignmentData && apartmentAssignmentData.apartmentId) {
      const newApartmentId = parseInt(apartmentAssignmentData.apartmentId);

      // Get current apartment assignment
      const [currentAssignment] = await connection.execute(
        'SELECT apartmentId FROM ApartmentAssigned WHERE tenantId = ?',
        [tenantId]
      );

      const currentApartmentId = currentAssignment.length > 0 ? currentAssignment[0].apartmentId : null;

      // Only proceed if apartment assignment is changing
      if (currentApartmentId !== newApartmentId) {
        // Remove old apartment assignment and reset status to 'Vacant'
        if (currentApartmentId) {
          await connection.execute(
            'DELETE FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?',
            [tenantId, currentApartmentId]
          );
          await connection.execute(
            'UPDATE apartment SET status = ? WHERE apartmentId = ?',
            ['Vacant', currentApartmentId]
          );
        }

        // Add new apartment assignment and set status to 'Rented'
        if (newApartmentId) {
          // Check if new apartment is available
          const [apartmentCheck] = await connection.execute(
            'SELECT status FROM apartment WHERE apartmentId = ?',
            [newApartmentId]
          );

          if (apartmentCheck.length === 0) {
            throw new Error('Apartment not found');
          }

          if (apartmentCheck[0].status === 'Rented') {
            throw new Error('Apartment is already rented');
          }

          await connection.execute(
            'INSERT INTO ApartmentAssigned (tenantId, apartmentId) VALUES (?, ?)',
            [tenantId, newApartmentId]
          );
          await connection.execute(
            'UPDATE apartment SET status = ? WHERE apartmentId = ?',
            ['Rented', newApartmentId]
          );

          // Handle contract updates if contract data is provided
          if (apartmentAssignmentData.contractStartDate && apartmentAssignmentData.contractEndDate) {
            // Delete old contract details
            await connection.execute(
              'DELETE FROM ContractDetails WHERE contractId IN (SELECT contractId FROM Contract WHERE tenantId = ?)',
              [tenantId]
            );

            // Delete old contract
            await connection.execute('DELETE FROM Contract WHERE tenantId = ?', [tenantId]);

            // Create new contract
            const contractQuery = `
              INSERT INTO Contract (SecurityFee, tenantId, startDate, endDate)
              VALUES (?, ?, ?, ?)
            `;
            const contractValues = [
              apartmentAssignmentData.securityFee || 0,
              tenantId,
              apartmentAssignmentData.contractStartDate,
              apartmentAssignmentData.contractEndDate
            ];

            const contractResult = await connection.execute(contractQuery, contractValues);
            const contractId = contractResult[0].insertId;

            // Create new contract details
            await connection.execute(
              'INSERT INTO ContractDetails (contractId, apartmentId) VALUES (?, ?)',
              [contractId, newApartmentId]
            );
          }
        }
      }
    }

    await connection.commit();
    return await getTenantById(tenantId);

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteTenant = async (tenantId) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  await db.execute('DELETE FROM tenant WHERE tenantId = ?', [tenantId]);

  await userModel.deleteUser(tenant.userId);

  return true;
};

const getTenantApartments = async (tenantId) => {
  const query = `
    SELECT aa.*, a.bedrooms, a.bathrooms, a.length, a.width, a.rentPrice,
           f.floorName, b.buildingName, b.buildingAddress
    FROM ApartmentAssigned aa
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE aa.tenantId = ?
  `;

  const [rows] = await db.execute(query, [tenantId]);
  return rows;
};

const assignApartment = async (tenantId, apartmentId, contractData = null) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Check if apartment exists and is vacant
  const apartmentCheck = await db.execute(
    'SELECT apartmentId, status FROM apartment WHERE apartmentId = ?',
    [apartmentId]
  );

  if (apartmentCheck[0].length === 0) {
    throw new Error('Apartment not found');
  }

  if (apartmentCheck[0][0].status === 'Rented') {
    throw new Error('Apartment is already rented');
  }

  const existingAssignment = await db.execute(
    'SELECT * FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?',
    [tenantId, apartmentId]
  );

  if (existingAssignment[0].length > 0) {
    throw new Error('Apartment already assigned to this tenant');
  }

  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Assign apartment to tenant
    const assignQuery = 'INSERT INTO ApartmentAssigned (tenantId, apartmentId) VALUES (?, ?)';
    const assignResult = await connection.execute(assignQuery, [tenantId, apartmentId]);
    const assignmentId = assignResult[0].insertId;

    // 2. Update apartment status to 'Rented'
    const statusUpdateQuery = 'UPDATE apartment SET status = ? WHERE apartmentId = ?';
    await connection.execute(statusUpdateQuery, ['Rented', apartmentId]);

    // 3. Create contract if contract data is provided
    let contractId = null;
    if (contractData && contractData.startDate && contractData.endDate) {
      const contractQuery = `
        INSERT INTO Contract (SecurityFee, tenantId, startDate, endDate)
        VALUES (?, ?, ?, ?)
      `;
      const contractValues = [
        contractData.securityFee || 0,
        tenantId,
        contractData.startDate,
        contractData.endDate
      ];
      const contractResult = await connection.execute(contractQuery, contractValues);
      contractId = contractResult[0].insertId;

      // 4. Link contract to apartment in ContractDetails
      const contractDetailsQuery = `
        INSERT INTO ContractDetails (contractId, apartmentId)
        VALUES (?, ?)
      `;
      await connection.execute(contractDetailsQuery, [contractId, apartmentId]);

      // Store data for payment schedule generation (will be done after transaction commits)
      var scheduleGenerationData = null;

      // Get apartment rent price for payment schedule
      const [apartmentData] = await connection.execute(
        'SELECT rentPrice FROM apartment WHERE apartmentId = ?',
        [apartmentId]
      );

      if (apartmentData.length > 0) {
        const rentAmount = apartmentData[0].rentPrice;

        scheduleGenerationData = {
          contractId,
          tenantId,
          apartmentId,
          startDate: contractData.startDate,
          endDate: contractData.endDate,
          rentAmount,
          securityFee: contractData.securityFee
        };
      }
    }

    await connection.commit();

    // Generate payment schedules AFTER the main transaction commits
    // This prevents lock timeout issues
    if (scheduleGenerationData) {
      try {
        console.log('Generating payment schedules after transaction commit...');

        // Generate monthly rent payment schedule
        await PaymentSchedule.generateMonthlyRentSchedule(scheduleGenerationData);

        // Generate security deposit schedule if applicable
        if (scheduleGenerationData.securityFee && scheduleGenerationData.securityFee > 0) {
          const depositData = {
            contractId: scheduleGenerationData.contractId,
            tenantId: scheduleGenerationData.tenantId,
            apartmentId: scheduleGenerationData.apartmentId,
            startDate: scheduleGenerationData.startDate,
            securityFee: scheduleGenerationData.securityFee
          };

          await PaymentSchedule.generateSecurityDepositSchedule(depositData);
        }

        console.log('Payment schedules generated successfully');
      } catch (scheduleError) {
        console.error('Error generating payment schedules:', scheduleError);
        // Don't fail the assignment if schedule generation fails
        // The assignment is already committed, so we just log the error
      }
    }

    return {
      assignmentId,
      contractId,
      tenantId,
      apartmentId,
      message: 'Apartment assigned successfully with payment schedules generated'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const removeApartmentAssignment = async (tenantId, apartmentId) => {
  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Check if assignment exists
    const checkQuery = 'SELECT * FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?';
    const checkResult = await connection.execute(checkQuery, [tenantId, apartmentId]);

    if (checkResult[0].length === 0) {
      await connection.rollback();
      return false;
    }

    // 2. Remove apartment assignment
    const deleteQuery = 'DELETE FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?';
    const deleteResult = await connection.execute(deleteQuery, [tenantId, apartmentId]);

    // 3. Update apartment status back to 'Vacant'
    const statusUpdateQuery = 'UPDATE apartment SET status = ? WHERE apartmentId = ?';
    await connection.execute(statusUpdateQuery, ['Vacant', apartmentId]);

    // 4. Optionally handle contract cleanup (you might want to keep contracts for history)
    // For now, we'll keep the contract but you could add logic to mark it as terminated

    await connection.commit();
    return deleteResult[0].affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getTenantStatistics = async () => {
  const query = `
    SELECT
      COUNT(*) as totalTenants,
      COUNT(DISTINCT t.userId) as uniqueUsers,
      COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as newThisMonth,
      COUNT(DISTINCT u.nationality) as uniqueNationalities
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
  `;

  const [rows] = await db.execute(query);
  return rows[0];
};

// Helper functions for tenant creation form
const getAllBuildings = async (filters = {}) => {
  let query = `
    SELECT buildingId, buildingName, buildingAddress, buildingCreatedDate
    FROM building
    WHERE 1 = 1
  `;

  const queryParams = [];

  // Add owner building filtering
  if (filters.ownerBuildings && filters.ownerBuildings.length > 0) {
    const placeholders = filters.ownerBuildings.map(() => '?').join(',');
    query += ` AND buildingId IN (${placeholders})`;
    queryParams.push(...filters.ownerBuildings);
  }

  query += ` ORDER BY buildingName`;

  const [rows] = await db.execute(query, queryParams);
  return rows;
};

const getFloorsByBuilding = async (buildingId) => {
  const query = `
    SELECT floorId, floorName, buildingId
    FROM floor
    WHERE buildingId = ?
    ORDER BY floorName
  `;
  const [rows] = await db.execute(query, [buildingId]);
  return rows;
};

const getApartmentsByFloor = async (floorId) => {
  const query = `
    SELECT a.apartmentId, a.bedrooms, a.bathrooms, a.length, a.width, a.rentPrice,a.status,a.description,
           f.floorName, b.buildingName
          
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    WHERE a.floorId = ?
    ORDER BY a.apartmentId
  `;
  const [rows] = await db.execute(query, [floorId]);
  return rows;
};

const getAvailableApartments = async () => {
  const query = `
    SELECT a.apartmentId, a.bedrooms, a.bathrooms, a.length, a.width, a.rentPrice,
           f.floorName, b.buildingName, b.buildingId, f.floorId
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    WHERE aa.tenantId IS NULL
    ORDER BY b.buildingName, f.floorName, a.apartmentId
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getAvailableTenantsForAssignment = async () => {
  const query = `
    SELECT t.tenantId, u.firstName, u.lastName, u.email, u.phoneNumber,
           t.occupation, u.nationality
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    WHERE aa.tenantId IS NULL
    ORDER BY u.firstName, u.lastName
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getTenantContracts = async (tenantId) => {
  const query = `
    SELECT
      c.contractId as contract_id,
      c.SecurityFee as security_fee,
      c.tenantId as tenant_id,
      DATE_FORMAT(c.startDate, '%Y-%m-%d') as start_date,
      DATE_FORMAT(c.endDate, '%Y-%m-%d') as end_date,
      c.createdAt as created_at,
      'Active' as contract_status,
      'Residential' as contract_type,
      a.rentPrice as monthly_rent_amount,
      'AED' as currency,
      CONCAT(b.buildingName, ' - ', f.floorName, ' - Apt ', a.apartmentId) as property_info,
      b.buildingAddress as property_address,
      a.bedrooms,
      a.bathrooms
    FROM Contract c
    INNER JOIN ContractDetails cd ON c.contractId = cd.contractId
    INNER JOIN apartment a ON cd.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE c.tenantId = ?
    ORDER BY c.createdAt DESC
  `;

  const [contracts] = await db.execute(query, [tenantId]);
  return contracts;
};

const getApartmentAssignments = async (filters = {}) => {
  let query = `
    SELECT
      aa.tenantId,
      aa.apartmentId,
      c.contractId,
      c.startDate,
      c.endDate,
      c.SecurityFee,
      t.userId,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      a.bedrooms,
      a.bathrooms,
      a.rentPrice,
      f.floorName,
      b.buildingId,
      b.buildingName,
      b.buildingAddress
    FROM ApartmentAssigned aa
    LEFT JOIN tenant t ON aa.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN Contract c ON aa.tenantId = c.tenantId AND aa.apartmentId IN (
      SELECT cd.apartmentId FROM ContractDetails cd WHERE cd.contractId = c.contractId
    )
    WHERE 1 = 1
  `;

  const queryParams = [];

  // Add owner building filtering
  if (filters.ownerBuildings && filters.ownerBuildings.length > 0) {
    const placeholders = filters.ownerBuildings.map(() => '?').join(',');
    query += ` AND b.buildingId IN (${placeholders})`;
    queryParams.push(...filters.ownerBuildings);
  }

  query += ` ORDER BY b.buildingName, f.floorName, a.apartmentId`;

  const [rows] = await db.execute(query, queryParams);
  return rows;
};

// Validate that apartment belongs to owner's assigned buildings
const validateApartmentForOwner = async (apartmentId, ownerBuildings) => {
  const query = `
    SELECT a.apartmentId, b.buildingId, b.buildingName
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE a.apartmentId = ?
  `;

  const [rows] = await db.execute(query, [apartmentId]);

  if (rows.length === 0) {
    return { isValid: false, message: 'Apartment not found' };
  }

  const apartment = rows[0];
  const isValid = ownerBuildings.includes(apartment.buildingId);

  return {
    isValid,
    apartment,
    message: isValid ? 'Valid' : `Apartment is in building ${apartment.buildingName} which is not assigned to you`
  };
};

export default {
  createTenant,
  getTenantById,
  getTenantByUserId,
  getTenantByEmail,
  getAllTenants,
  updateTenant,
  deleteTenant,
  getTenantApartments,
  assignApartment,
  removeApartmentAssignment,
  getTenantCount,
  getTenantStatistics,
  getAllBuildings,
  getFloorsByBuilding,
  getApartmentsByFloor,
  getAvailableApartments,
  getAvailableTenantsForAssignment,
  getApartmentAssignments,
  getTenantContracts,
  validateApartmentForOwner
};
