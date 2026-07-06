-- Ritam OS — Initial Database Setup
-- This script runs automatically on first PostgreSQL container start.
-- It is mounted at /docker-entrypoint-initdb.d/init.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------
-- (Optional) Create a read-only analytics user for reporting tools.
-- Uncomment and set a strong password when needed:
-- -------------------------------------------------------------------
-- CREATE USER ritam_readonly WITH PASSWORD 'change-me';
-- GRANT CONNECT ON DATABASE ritam_prod TO ritam_readonly;
-- GRANT USAGE ON SCHEMA public TO ritam_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO ritam_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ritam_readonly;
