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
  id                    VARCHAR(255) PRIMARY KEY,
  nama                  VARCHAR(255),
  gender                VARCHAR(50),
  membership            VARCHAR(100),
  start_date            DATE,
  expiry_date           DATE,
  class                 VARCHAR(100),
  house                 VARCHAR(100),
  trainer_homeroom      VARCHAR(255),
  date_of_birthday      DATE,
  kelas                 VARCHAR(100),
  email_account_parents VARCHAR(255),
  nomor_wa_parent       VARCHAR(50),
  nomor_wa_trainee      VARCHAR(50),
  nama_sekolah          VARCHAR(255)
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
