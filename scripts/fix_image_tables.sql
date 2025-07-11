-- Fix Database Schema Issues for Image Tables
-- This script fixes the column types for building and apartment image tables

-- Create floor images table first
CREATE TABLE IF NOT EXISTS `floorImages` (
  `imageId` int NOT NULL AUTO_INCREMENT,
  `floorId` int NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`imageId`),
  INDEX `idx_floor_id` (`floorId`),
  CONSTRAINT `fk_floor_image_floor`
  FOREIGN KEY (`floorId`) REFERENCES `floor` (`floorId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `apartmentImages` 
ADD CONSTRAINT `fk_apartment_image_apartment` 
FOREIGN KEY (`apartmentId`) REFERENCES `apartment` (`apartmentId`) ON DELETE CASCADE;

ALTER TABLE `floorImages` 
ADD CONSTRAINT `fk_floor_image_floor` 
FOREIGN KEY (`floorId`) REFERENCES `floor` (`floorId`) ON DELETE CASCADE;

ALTER TABLE `apartmentAmenities` 
ADD CONSTRAINT `fk_apartment_amenities_apartment` 
FOREIGN KEY (`apartmentId`) REFERENCES `apartment` (`apartmentId`) ON DELETE CASCADE;
