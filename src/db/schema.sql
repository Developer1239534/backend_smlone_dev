-- Neon PostgreSQL Schema for SMLONE House Selection

-- Tabel credential_portal
CREATE TABLE IF NOT EXISTS credential_portal (
  id                VARCHAR(255) PRIMARY KEY,
  nama              VARCHAR(255),
  membership_status VARCHAR(255),
  password          VARCHAR(255)
);

-- Tabel profile_trainee
CREATE TABLE IF NOT EXISTS profile_trainee (
  "ID"                    VARCHAR(255) PRIMARY KEY,
  "Nama"                  VARCHAR(255),
  "Gender"                VARCHAR(50),
  "Membership"            VARCHAR(100),
  "Start Date"            TEXT,
  "Expiry Date"           TEXT,
  "Class"                 VARCHAR(100),
  "House"                 VARCHAR(100),
  "Trainer Homeroom"      VARCHAR(255),
  "Date of Birthday"      TEXT,
  "Kelas"                 VARCHAR(100),
  "Email Account Parents" VARCHAR(255),
  "Nomor WA Parent"       VARCHAR(100),
  "Nomor WA Trainee"      VARCHAR(100),
  "Nama Sekolah"          VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS houses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  core_value VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL
);
