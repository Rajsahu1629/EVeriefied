#!/usr/bin/env bash
# Create local PostgreSQL role + database for EVerified development
set -euo pipefail

DB_NAME="${EV_DB_NAME:-everified}"
DB_USER="${EV_DB_USER:-everified}"
DB_PASS="${EV_DB_PASS:-everified_local}"

echo "Starting PostgreSQL..."
sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start

echo "Creating role and database (if missing)..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}' CREATEDB;
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "Done. Connection string:"
echo "postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
