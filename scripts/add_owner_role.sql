-- Add owner role to the system
-- This script adds the 'owner' role to support building owners who can manage their assigned buildings

-- Insert owner role if it doesn't exist
INSERT IGNORE INTO `role` (`roleName`) VALUES ('owner');

-- Verify the role was added
SELECT * FROM `role` ORDER BY `roleId`;

-- The buildingAssigned table already exists with the correct structure:
-- buildingAssignedId (int, primary key)
-- buildingId (int, foreign key to building table)
-- userId (int, foreign key to user table)

-- This table will be used to assign buildings to owners
-- When a user with 'owner' role logs in, they will only see:
-- - Buildings assigned to them in buildingAssigned table
-- - Tenants in apartments within those buildings
-- - Apartments and floors within those buildings

-- Example of how building assignment will work:
-- INSERT INTO buildingAssigned (buildingId, userId) VALUES (1, 5);
-- This assigns building with ID 1 to user with ID 5 (who should have owner role)
