-- Add name column to users table for personalised greetings
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT '';
