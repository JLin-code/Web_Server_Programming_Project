# Database Setup Instructions

This directory contains SQL files for database setup.

## Files Overview

1. `01_create_schema.sql` - Creates all database tables and indexes
2. `02_seed_data.sql` - Inserts sample data for development and testing
3. `03_create_functions.sql` - Creates database functions for application features

## Setting up the database

Run the database setup script which will execute these files in order:

```bash
node tools/db_setup.js
```

## Troubleshooting

If your SQL files are located elsewhere, you can use the `--path` argument:

```bash
node tools/db_setup.js --path=/path/to/your/sql/files
```

## Database Structure

This fitness tracker database includes:

- **Users**: Store user accounts and authentication details
- **Activities**: Store fitness activities logged by users
- **Activity Comments**: Store comments on activities
- **Activity Likes**: Track likes on activities
- **Friends**: Track connections between users

## Functions

The database includes functions for:
- User statistics (daily, weekly, monthly, all-time)
- Global platform statistics
- Like and comment tracking
- Performance optimization via counters and indexes
