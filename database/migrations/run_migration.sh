#!/bin/bash

# Railway Database Migration Script
# Usage: ./run_migration.sh <migration_file>

set -e

echo "🚀 Railway Database Migration"
echo "=============================="
echo ""

# Check if migration file provided
if [ -z "$1" ]; then
    echo "❌ Error: No migration file specified"
    echo "Usage: ./run_migration.sh <migration_file.sql>"
    echo ""
    echo "Available migrations:"
    ls -1 *.sql 2>/dev/null || echo "No migration files found"
    exit 1
fi

MIGRATION_FILE=$1

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file '$MIGRATION_FILE' not found"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Prompt for Railway credentials
echo "Enter Railway MySQL credentials:"
echo "(You can find these in Railway Dashboard > MySQL > Connect tab)"
echo ""

read -p "Host: " DB_HOST
read -p "Port [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}
read -p "Database [bull_run]: " DB_NAME
DB_NAME=${DB_NAME:-bull_run}
read -p "Username [root]: " DB_USER
DB_USER=${DB_USER:-root}
read -sp "Password: " DB_PASSWORD
echo ""
echo ""

# Confirm before running
echo "⚠️  About to run migration on:"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Database: $DB_NAME"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Running migration..."
echo ""

# Run migration
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test API endpoint: curl https://your-app.railway.app/api/user/303/history/income"
    echo "2. Push code to GitHub"
    echo "3. Verify deployment on Railway"
else
    echo ""
    echo "❌ Migration failed!"
    exit 1
fi
