-- Dynamic Sidebar Pages System
-- This script creates tables for managing sidebar pages dynamically

-- 1. Create sidebar_pages table
CREATE TABLE IF NOT EXISTS `sidebar_pages` (
  `pageId` int NOT NULL AUTO_INCREMENT,
  `pageName` varchar(100) NOT NULL,
  `pageUrl` varchar(200) NOT NULL,
  `pageIcon` varchar(50) NOT NULL,
  `displayOrder` int DEFAULT 0,
  `isActive` tinyint(1) DEFAULT 1,
  `description` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pageId`),
  UNIQUE KEY `unique_page_url` (`pageUrl`),
  INDEX `idx_display_order` (`displayOrder`),
  INDEX `idx_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Create page_permissions table (defines what permissions are available for each page)
CREATE TABLE IF NOT EXISTS `page_permissions` (
  `pagePermissionId` int NOT NULL AUTO_INCREMENT,
  `pageId` int NOT NULL,
  `permissionType` enum('view', 'create', 'update', 'delete', 'manage') NOT NULL,
  `permissionName` varchar(100) NOT NULL,
  `description` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pagePermissionId`),
  UNIQUE KEY `unique_page_permission` (`pageId`, `permissionType`),
  CONSTRAINT `fk_page_permissions_page` FOREIGN KEY (`pageId`) REFERENCES `sidebar_pages` (`pageId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Create role_page_permissions table (assigns permissions to roles for specific pages)
CREATE TABLE IF NOT EXISTS `role_page_permissions` (
  `rolePagePermissionId` int NOT NULL AUTO_INCREMENT,
  `roleId` int NOT NULL,
  `pageId` int NOT NULL,
  `permissionType` enum('view', 'create', 'update', 'delete', 'manage') NOT NULL,
  `isGranted` tinyint(1) DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rolePagePermissionId`),
  UNIQUE KEY `unique_role_page_permission` (`roleId`, `pageId`, `permissionType`),
  CONSTRAINT `fk_role_page_permissions_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`roleId`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_page_permissions_page` FOREIGN KEY (`pageId`) REFERENCES `sidebar_pages` (`pageId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Insert default sidebar pages
INSERT INTO `sidebar_pages` (`pageName`, `pageUrl`, `pageIcon`, `displayOrder`, `description`) VALUES
('Dashboard', '/admin/dashboard', 'grid', 1, 'Main dashboard with overview and statistics'),
('Tenants', '/admin/tenants', 'users', 2, 'Manage tenants and tenant information'),
('Buildings', '/admin/buildings', 'building', 3, 'Manage buildings and building details'),
('Villas', '/admin/villas', 'home', 4, 'Manage villas and villa information'),
('Virtual Tour', '/admin/virtual-demo', 'video', 5, 'Virtual tour and demo functionality'),
('Vendors', '/admin/vendors', 'briefcase', 6, 'Manage vendors and vendor relationships'),
('Financial Transactions', '/admin/financial-transactions', 'credit-card', 7, 'Manage financial transactions and payments'),
('User Management', '/admin/user-management', 'user-group', 8, 'Manage system users and user accounts'),
('Messages', '/admin/messages', 'chat', 9, 'Manage messages and communications'),
('Permissions & Roles', '/admin/permissions', 'shield', 10, 'Manage permissions and role assignments');

-- 5. Insert default page permissions for each page
INSERT INTO `page_permissions` (`pageId`, `permissionType`, `permissionName`, `description`) 
SELECT 
  p.pageId,
  'view',
  CONCAT(LOWER(REPLACE(p.pageName, ' ', '_')), '.view'),
  CONCAT('View access to ', p.pageName, ' page')
FROM `sidebar_pages` p;

INSERT INTO `page_permissions` (`pageId`, `permissionType`, `permissionName`, `description`) 
SELECT 
  p.pageId,
  'create',
  CONCAT(LOWER(REPLACE(p.pageName, ' ', '_')), '.create'),
  CONCAT('Create access to ', p.pageName, ' page')
FROM `sidebar_pages` p
WHERE p.pageName NOT IN ('Dashboard', 'Virtual Tour');

INSERT INTO `page_permissions` (`pageId`, `permissionType`, `permissionName`, `description`) 
SELECT 
  p.pageId,
  'update',
  CONCAT(LOWER(REPLACE(p.pageName, ' ', '_')), '.update'),
  CONCAT('Update access to ', p.pageName, ' page')
FROM `sidebar_pages` p
WHERE p.pageName NOT IN ('Dashboard', 'Virtual Tour');

INSERT INTO `page_permissions` (`pageId`, `permissionType`, `permissionName`, `description`) 
SELECT 
  p.pageId,
  'delete',
  CONCAT(LOWER(REPLACE(p.pageName, ' ', '_')), '.delete'),
  CONCAT('Delete access to ', p.pageName, ' page')
FROM `sidebar_pages` p
WHERE p.pageName NOT IN ('Dashboard', 'Virtual Tour', 'Messages');

INSERT INTO `page_permissions` (`pageId`, `permissionType`, `permissionName`, `description`) 
SELECT 
  p.pageId,
  'manage',
  CONCAT(LOWER(REPLACE(p.pageName, ' ', '_')), '.manage'),
  CONCAT('Full management access to ', p.pageName, ' page')
FROM `sidebar_pages` p
WHERE p.pageName IN ('User Management', 'Permissions & Roles');

-- 6. Grant all permissions to admin role (roleId = 1) by default
INSERT INTO `role_page_permissions` (`roleId`, `pageId`, `permissionType`, `isGranted`)
SELECT 
  1 as roleId,
  pp.pageId,
  pp.permissionType,
  1 as isGranted
FROM `page_permissions` pp;

-- 7. Grant basic permissions to owner role (roleId = 2) by default
INSERT INTO `role_page_permissions` (`roleId`, `pageId`, `permissionType`, `isGranted`)
SELECT 
  2 as roleId,
  pp.pageId,
  pp.permissionType,
  1 as isGranted
FROM `page_permissions` pp
INNER JOIN `sidebar_pages` sp ON pp.pageId = sp.pageId
WHERE sp.pageName IN ('Dashboard', 'Tenants', 'Buildings', 'Villas', 'Financial Transactions', 'Messages')
AND pp.permissionType IN ('view', 'create');

-- 8. Create view for easy querying of user page permissions
CREATE OR REPLACE VIEW `user_page_permissions` AS
SELECT 
  u.userId,
  u.firstName,
  u.lastName,
  u.email,
  r.roleId,
  r.roleName,
  sp.pageId,
  sp.pageName,
  sp.pageUrl,
  sp.pageIcon,
  sp.displayOrder,
  pp.permissionType,
  pp.permissionName,
  COALESCE(rpp.isGranted, 0) as isGranted
FROM user u
INNER JOIN userRole ur ON u.userId = ur.userId
INNER JOIN role r ON ur.roleId = r.roleId
CROSS JOIN sidebar_pages sp
INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
LEFT JOIN role_page_permissions rpp ON r.roleId = rpp.roleId 
  AND sp.pageId = rpp.pageId 
  AND pp.permissionType = rpp.permissionType
WHERE sp.isActive = 1
ORDER BY u.userId, sp.displayOrder, pp.permissionType;

-- 9. Create indexes for performance
CREATE INDEX `idx_role_page_permissions_role` ON `role_page_permissions` (`roleId`);
CREATE INDEX `idx_role_page_permissions_page` ON `role_page_permissions` (`pageId`);
CREATE INDEX `idx_page_permissions_page` ON `page_permissions` (`pageId`);
