-- Update Users table to add required fields for authentication
ALTER TABLE Users 
ADD COLUMN password VARCHAR(255) AFTER email,
ADD COLUMN first_name VARCHAR(255) AFTER role,
ADD COLUMN last_name VARCHAR(255) AFTER first_name,
ADD COLUMN phone_number VARCHAR(255) AFTER last_name,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER phone_number,
ADD COLUMN last_login TIMESTAMP NULL AFTER is_active;

-- Make email unique
ALTER TABLE Users ADD UNIQUE KEY unique_email (email);

-- Make username unique  
ALTER TABLE Users ADD UNIQUE KEY unique_username (username);

-- Update existing records to have default values
UPDATE Users SET 
  password = '$2a$12$defaulthashedpassword', 
  is_active = TRUE 
WHERE password IS NULL;
