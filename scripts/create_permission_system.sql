-- Enterprise-Level Dynamic Permission System
-- This script creates a comprehensive role-based access control system

-- 1. Create permissions table
CREATE TABLE IF NOT EXISTS `permissions` (
  `permissionId` int NOT NULL AUTO_INCREMENT,
  `permissionName` varchar(100) NOT NULL UNIQUE,
  `resource` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permissionId`),
  INDEX `idx_resource_action` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `rolePermissionId` int NOT NULL AUTO_INCREMENT,
  `roleId` int NOT NULL,
  `permissionId` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rolePermissionId`),
  UNIQUE KEY `unique_role_permission` (`roleId`, `permissionId`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`roleId`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`permissionId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Insert core permissions for the system
INSERT IGNORE INTO `permissions` (`permissionName`, `resource`, `action`, `description`) VALUES
-- Dashboard permissions
('dashboard.view', 'dashboard', 'view', 'View dashboard'),

-- User management permissions
('users.view', 'users', 'view', 'View users'),
('users.create', 'users', 'create', 'Create new users'),
('users.update', 'users', 'update', 'Update user information'),
('users.delete', 'users', 'delete', 'Delete users'),

-- Role management permissions
('roles.view', 'roles', 'view', 'View roles'),
('roles.create', 'roles', 'create', 'Create new roles'),
('roles.update', 'roles', 'update', 'Update role information'),
('roles.delete', 'roles', 'delete', 'Delete roles'),

-- Building permissions
('buildings.view', 'buildings', 'view', 'View buildings'),
('buildings.view_own', 'buildings', 'view_own', 'View own assigned buildings'),
('buildings.create', 'buildings', 'create', 'Create new buildings'),
('buildings.update', 'buildings', 'update', 'Update building information'),
('buildings.update_own', 'buildings', 'update_own', 'Update own assigned buildings'),
('buildings.delete', 'buildings', 'delete', 'Delete buildings'),
('buildings.assign', 'buildings', 'assign', 'Assign buildings to owners'),

-- Villa permissions
('villas.view', 'villas', 'view', 'View all villas'),
('villas.view_own', 'villas', 'view_own', 'View own assigned villas'),
('villas.create', 'villas', 'create', 'Create new villas'),
('villas.update', 'villas', 'update', 'Update villa information'),
('villas.update_own', 'villas', 'update_own', 'Update own assigned villas'),
('villas.delete', 'villas', 'delete', 'Delete villas'),
('villas.assign', 'villas', 'assign', 'Assign villas to owners'),

-- Apartment permissions
('apartments.view', 'apartments', 'view', 'View all apartments'),
('apartments.view_own', 'apartments', 'view_own', 'View apartments in own buildings'),
('apartments.create', 'apartments', 'create', 'Create new apartments'),
('apartments.update', 'apartments', 'update', 'Update apartment information'),
('apartments.update_own', 'apartments', 'update_own', 'Update apartments in own buildings'),
('apartments.delete', 'apartments', 'delete', 'Delete apartments'),
('apartments.assign', 'apartments', 'assign', 'Assign apartments to tenants'),

-- Tenant permissions
('tenants.view', 'tenants', 'view', 'View all tenants'),
('tenants.view_own', 'tenants', 'view_own', 'View tenants in own properties'),
('tenants.create', 'tenants', 'create', 'Create new tenants'),
('tenants.update', 'tenants', 'update', 'Update tenant information'),
('tenants.update_own', 'tenants', 'update_own', 'Update tenants in own properties'),
('tenants.delete', 'tenants', 'delete', 'Delete tenants'),

-- Financial permissions
('transactions.view', 'transactions', 'view', 'View all transactions'),
('transactions.view_own', 'transactions', 'view_own', 'View transactions for own properties'),
('transactions.create', 'transactions', 'create', 'Create new transactions'),
('transactions.update', 'transactions', 'update', 'Update transaction information'),
('transactions.delete', 'transactions', 'delete', 'Delete transactions'),

-- Vendor permissions
('vendors.view', 'vendors', 'view', 'View vendors'),
('vendors.create', 'vendors', 'create', 'Create new vendors'),
('vendors.update', 'vendors', 'update', 'Update vendor information'),
('vendors.delete', 'vendors', 'delete', 'Delete vendors'),

-- Message permissions
('messages.view', 'messages', 'view', 'View messages'),
('messages.create', 'messages', 'create', 'Send messages'),
('messages.update', 'messages', 'update', 'Update messages'),
('messages.delete', 'messages', 'delete', 'Delete messages');

-- 4. Assign permissions to admin role (roleId = 1)
INSERT IGNORE INTO `role_permissions` (`roleId`, `permissionId`)
SELECT 1, `permissionId` FROM `permissions`;

-- 5. Assign specific permissions to owner role (roleId = 2)
INSERT IGNORE INTO `role_permissions` (`roleId`, `permissionId`)
SELECT 2, `permissionId` FROM `permissions` 
WHERE `permissionName` IN (
  'dashboard.view',
  'buildings.view_own',
  'buildings.update_own',
  'villas.view_own',
  'villas.update_own',
  'apartments.view_own',
  'apartments.update_own',
  'apartments.assign',
  'tenants.view_own',
  'tenants.create',
  'tenants.update_own',
  'transactions.view_own',
  'messages.view',
  'messages.create'
);

-- 6. Create a view for easy permission checking
CREATE OR REPLACE VIEW `user_permissions` AS
SELECT 
  u.userId,
  u.firstName,
  u.lastName,
  u.email,
  r.roleId,
  r.roleName,
  p.permissionId,
  p.permissionName,
  p.resource,
  p.action,
  p.description
FROM user u
INNER JOIN userRole ur ON u.userId = ur.userId
INNER JOIN role r ON ur.roleId = r.roleId
INNER JOIN role_permissions rp ON r.roleId = rp.roleId
INNER JOIN permissions p ON rp.permissionId = p.permissionId;

-- 7. Create indexes for performance (Note: Views cannot have indexes, so we skip user_permissions view indexes)
-- CREATE INDEX `idx_permissions_resource` ON `permissions` (`resource`);
-- CREATE INDEX `idx_role_permissions_role` ON `role_permissions` (`roleId`);
