-- Neon PostgreSQL Schema for SMLONE House Selection

-- Tabel credential_portal
CREATE TABLE IF NOT EXISTS credential_portal (
  id                VARCHAR(255) PRIMARY KEY,
  nama              VARCHAR(255),
  membership_status VARCHAR(255),
  password          VARCHAR(255)
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
