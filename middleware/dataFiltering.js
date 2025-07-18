import db from '../config/db.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Comprehensive Data Filtering Middleware
 * Applies role-based data filtering across all modules
 */

// Get user's assigned buildings for data filtering
export const getUserAssignedBuildings = async (userId, roleId) => {
  try {
    // Admin has access to all buildings
    if (roleId === 1) {
      return null; // null means no filtering
    }

    // Get buildings assigned to this user
    const [buildings] = await db.execute(`
      SELECT buildingId FROM buildingAssigned WHERE userId = ?
    `, [userId]);

    return buildings.map(b => b.buildingId);
  } catch (error) {
    console.error('Error getting user assigned buildings:', error);
    return [];
  }
};

// Get user's assigned villas for data filtering
export const getUserAssignedVillas = async (userId, roleId) => {
  try {
    // Admin has access to all villas
    if (roleId === 1) {
      return null; // null means no filtering
    }

    // Get villas assigned to this user
    const [villas] = await db.execute(`
      SELECT villasId FROM villaAssigned WHERE userId = ?
    `, [userId]);

    return villas.map(v => v.villasId);
  } catch (error) {
    console.error('Error getting user assigned villas:', error);
    return [];
  }
};

// Get user's accessible tenants based on building assignments
export const getUserAccessibleTenants = async (userId, roleId, assignedBuildings) => {
  try {
    // Admin has access to all tenants
    if (roleId === 1) {
      return null; // null means no filtering
    }

    if (!assignedBuildings || assignedBuildings.length === 0) {
      return [];
    }

    // Get tenants in assigned buildings
    const placeholders = assignedBuildings.map(() => '?').join(',');
    const [tenants] = await db.execute(`
      SELECT DISTINCT t.tenantId 
      FROM tenant t
      INNER JOIN apartmentAssigned aa ON t.tenantId = aa.tenantId
      INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
      INNER JOIN floor f ON a.floorId = f.floorId
      WHERE f.buildingId IN (${placeholders})
    `, assignedBuildings);

    return tenants.map(t => t.tenantId);
  } catch (error) {
    console.error('Error getting user accessible tenants:', error);
    return [];
  }
};

// Get user's accessible apartments based on building assignments
export const getUserAccessibleApartments = async (userId, roleId, assignedBuildings) => {
  try {
    // Admin has access to all apartments
    if (roleId === 1) {
      return null; // null means no filtering
    }

    if (!assignedBuildings || assignedBuildings.length === 0) {
      return [];
    }

    // Get apartments in assigned buildings
    const placeholders = assignedBuildings.map(() => '?').join(',');
    const [apartments] = await db.execute(`
      SELECT a.apartmentId 
      FROM apartment a
      INNER JOIN floor f ON a.floorId = f.floorId
      WHERE f.buildingId IN (${placeholders})
    `, assignedBuildings);

    return apartments.map(a => a.apartmentId);
  } catch (error) {
    console.error('Error getting user accessible apartments:', error);
    return [];
  }
};

// Get user's accessible financial transactions
export const getUserAccessibleTransactions = async (userId, roleId, assignedBuildings, assignedVillas) => {
  try {
    // Admin has access to all transactions
    if (roleId === 1) {
      return null; // null means no filtering
    }

    const transactionIds = [];

    // Get transactions for assigned buildings
    if (assignedBuildings && assignedBuildings.length > 0) {
      const buildingPlaceholders = assignedBuildings.map(() => '?').join(',');
      const [buildingTransactions] = await db.execute(`
        SELECT DISTINCT ft.transactionId 
        FROM financialTransaction ft
        INNER JOIN apartmentAssigned aa ON ft.tenantId = aa.tenantId
        INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
        INNER JOIN floor f ON a.floorId = f.floorId
        WHERE f.buildingId IN (${buildingPlaceholders})
      `, assignedBuildings);
      
      transactionIds.push(...buildingTransactions.map(t => t.transactionId));
    }

    // Get transactions for assigned villas
    if (assignedVillas && assignedVillas.length > 0) {
      const villaPlaceholders = assignedVillas.map(() => '?').join(',');
      const [villaTransactions] = await db.execute(`
        SELECT DISTINCT ft.transactionId 
        FROM financialTransaction ft
        INNER JOIN villaAssigned va ON ft.tenantId = va.tenantId
        WHERE va.villasId IN (${villaPlaceholders})
      `, assignedVillas);
      
      transactionIds.push(...villaTransactions.map(t => t.transactionId));
    }

    return [...new Set(transactionIds)]; // Remove duplicates
  } catch (error) {
    console.error('Error getting user accessible transactions:', error);
    return [];
  }
};

// Get users that the current user can manage (hierarchical)
export const getUserManageableUsers = async (userId, roleId) => {
  try {
    // Admin can manage all users
    if (roleId === 1) {
      return null; // null means no filtering
    }

    // Owner can only manage users they created
    if (roleId === 2) {
      const [users] = await db.execute(`
        SELECT userId FROM user WHERE createdBy = ? OR userId = ?
      `, [userId, userId]); // Include self
      
      return users.map(u => u.userId);
    }

    // Staff roles can only manage themselves
    return [userId];
  } catch (error) {
    console.error('Error getting user manageable users:', error);
    return [userId]; // Fallback to self only
  }
};

// Main data filtering middleware
export const applyDataFiltering = async (req, res, next) => {
  try {
    const { userId, roleId } = req.user;

    console.log(`🔍 Applying data filtering for user ${userId} (role: ${roleId})`);

    // Get all user assignments
    const assignedBuildings = await getUserAssignedBuildings(userId, roleId);
    const assignedVillas = await getUserAssignedVillas(userId, roleId);
    const accessibleTenants = await getUserAccessibleTenants(userId, roleId, assignedBuildings);
    const accessibleApartments = await getUserAccessibleApartments(userId, roleId, assignedBuildings);
    const accessibleTransactions = await getUserAccessibleTransactions(userId, roleId, assignedBuildings, assignedVillas);
    const manageableUsers = await getUserManageableUsers(userId, roleId);

    // Attach filtering data to request
    req.dataFilter = {
      userId,
      roleId,
      assignedBuildings,
      assignedVillas,
      accessibleTenants,
      accessibleApartments,
      accessibleTransactions,
      manageableUsers,
      isAdmin: roleId === 1,
      isOwner: roleId === 2,
      isStaff: roleId >= 3 && roleId <= 6
    };

    console.log(`✅ Data filtering applied:`, {
      buildings: assignedBuildings?.length || 'ALL',
      villas: assignedVillas?.length || 'ALL',
      tenants: accessibleTenants?.length || 'ALL',
      apartments: accessibleApartments?.length || 'ALL',
      transactions: accessibleTransactions?.length || 'ALL',
      users: manageableUsers?.length || 'ALL'
    });

    next();
  } catch (error) {
    console.error('Error in data filtering middleware:', error);
    return next(new ErrorResponse('Data filtering error', 500));
  }
};

// Helper function to apply building filter to query
export const applyBuildingFilter = (baseQuery, params, assignedBuildings, tableAlias = 'b') => {
  if (!assignedBuildings) return { query: baseQuery, params };

  if (assignedBuildings.length === 0) {
    return { 
      query: baseQuery + ` AND 1=0`, // No results
      params 
    };
  }

  const placeholders = assignedBuildings.map(() => '?').join(',');
  return {
    query: baseQuery + ` AND ${tableAlias}.buildingId IN (${placeholders})`,
    params: [...params, ...assignedBuildings]
  };
};

// Helper function to apply villa filter to query
export const applyVillaFilter = (baseQuery, params, assignedVillas, tableAlias = 'v') => {
  if (!assignedVillas) return { query: baseQuery, params };

  if (assignedVillas.length === 0) {
    return { 
      query: baseQuery + ` AND 1=0`, // No results
      params 
    };
  }

  const placeholders = assignedVillas.map(() => '?').join(',');
  return {
    query: baseQuery + ` AND ${tableAlias}.villasId IN (${placeholders})`,
    params: [...params, ...assignedVillas]
  };
};

// Helper function to apply tenant filter to query
export const applyTenantFilter = (baseQuery, params, accessibleTenants, tableAlias = 't') => {
  if (!accessibleTenants) return { query: baseQuery, params };

  if (accessibleTenants.length === 0) {
    return { 
      query: baseQuery + ` AND 1=0`, // No results
      params 
    };
  }

  const placeholders = accessibleTenants.map(() => '?').join(',');
  return {
    query: baseQuery + ` AND ${tableAlias}.tenantId IN (${placeholders})`,
    params: [...params, ...accessibleTenants]
  };
};

// Helper function to apply user filter to query
export const applyUserFilter = (baseQuery, params, manageableUsers, tableAlias = 'u') => {
  if (!manageableUsers) return { query: baseQuery, params };

  if (manageableUsers.length === 0) {
    return { 
      query: baseQuery + ` AND 1=0`, // No results
      params 
    };
  }

  const placeholders = manageableUsers.map(() => '?').join(',');
  return {
    query: baseQuery + ` AND ${tableAlias}.userId IN (${placeholders})`,
    params: [...params, ...manageableUsers]
  };
};

export default {
  applyDataFiltering,
  getUserAssignedBuildings,
  getUserAssignedVillas,
  getUserAccessibleTenants,
  getUserAccessibleApartments,
  getUserAccessibleTransactions,
  getUserManageableUsers,
  applyBuildingFilter,
  applyVillaFilter,
  applyTenantFilter,
  applyUserFilter
};
