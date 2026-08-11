-- ============================================================
-- India Mind League — Admin panel schema migration
-- Run this once in phpMyAdmin (Database: india_mind_league)
-- ============================================================

-- 1) Add a status column to the existing registrations table.
--    (register.php doesn't set this, so it will default to 'Registered'
--     for new public sign-ups; admin can change it later.)
ALTER TABLE registrations
  ADD COLUMN status ENUM('Registered','Test Taken','Qualified')
  NOT NULL DEFAULT 'Registered' AFTER email;

-- 2) Schools
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) DEFAULT NULL,
  coordinator VARCHAR(150) DEFAULT NULL,
  contact VARCHAR(50) DEFAULT NULL,
  students INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Question bank
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grade VARCHAR(10) NOT NULL,
  category ENUM('IQ','EQ','Values') NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_index TINYINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;