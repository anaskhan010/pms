-- Villa Database Migration Script
-- This script fixes the villa tables structure and adds proper constraints

-- Fix villaImages table structure
DROP TABLE IF EXISTS `villaImages`;
CREATE TABLE `villaImages` (
  `imageId` int NOT NULL AUTO_INCREMENT,
  `villaId` int NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`imageId`),
  KEY `idx_villa_id` (`villaId`),
  CONSTRAINT `fk_villa_image_villa` FOREIGN KEY (`villaId`) REFERENCES `villas` (`villasId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Fix villasAssigned table (rename from villasAsigned)
DROP TABLE IF EXISTS `villasAsigned`;
DROP TABLE IF EXISTS `villasAssigned`;
CREATE TABLE `villasAssigned` (
  `assignId` int NOT NULL AUTO_INCREMENT,
  `villaId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignId`),
  CONSTRAINT `fk_villa_assigned_villa` FOREIGN KEY (`villaId`) REFERENCES `villas` (`villasId`) ON DELETE CASCADE,
  CONSTRAINT `fk_villa_assigned_user` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add foreign key constraint to villasFeature table
ALTER TABLE `villasFeature` 
ADD CONSTRAINT `fk_villa_feature_villa` FOREIGN KEY (`villaId`) REFERENCES `villas` (`villasId`) ON DELETE CASCADE;
