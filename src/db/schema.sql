-- Neon PostgreSQL Schema for SMLONE House Selection

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

CREATE TABLE IF NOT EXISTS user_results (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  assigned_house VARCHAR(50) REFERENCES houses(id),
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
