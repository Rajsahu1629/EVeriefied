-- EVeerified Native App - Database Schema
-- Execute this SQL in your Neon database console

-- Users table (for technicians/workers)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10),
    qualification VARCHAR(50),
    experience VARCHAR(50),
    current_workshop VARCHAR(255),
    brand_workshop VARCHAR(255),
    brands JSONB,
    role VARCHAR(50) NOT NULL DEFAULT 'technician',
    verification_status VARCHAR(50) DEFAULT 'pending',
    verification_step INTEGER DEFAULT 0,
    quiz_score INTEGER,
    total_questions INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruiters table (for companies posting jobs)
CREATE TABLE IF NOT EXISTS recruiters (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job posts table
CREATE TABLE IF NOT EXISTS job_posts (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    role_required VARCHAR(100) NOT NULL,
    number_of_people VARCHAR(10),
    experience VARCHAR(50),
    salary_min INTEGER,
    salary_max INTEGER,
    has_incentive BOOLEAN DEFAULT FALSE,
    pincode VARCHAR(10),
    city VARCHAR(100),
    stay_provided BOOLEAN DEFAULT FALSE,
    urgency VARCHAR(50) DEFAULT 'within_7_days',
    status VARCHAR(50) DEFAULT 'received',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_recruiters_phone ON recruiters(phone_number);
CREATE INDEX IF NOT EXISTS idx_job_posts_recruiter ON job_posts(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_active ON job_posts(is_active);

-- Verify tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
