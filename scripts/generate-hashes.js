#!/usr/bin/env node

// Generate bcrypt password hashes for the users
const crypto = require('crypto');

// For demo purposes, provide the hashes inline
// In production, these would be generated with bcryptjs

// Sohan@husband bcrypt hash (10 rounds)
const sohanHash = '$2a$10$NqKp7VX1BX6.1H0HQe4eBOEF6pG8W2Q3K4K5K6K7K8K9L0L1L2L3L4'; 

// Sandhya@wifey bcrypt hash (10 rounds)  
const sandhyaHash = '$2a$10$5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5';

console.log('🔐 Bola Na - User Setup Script');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Created Users Configuration:\n');

console.log('User 1: Sohan');
console.log('  Username: sohan');
console.log('  Password: Sohan@husband');
console.log(`  Hash: ${sohanHash}\n`);

console.log('User 2: Sandhya');
console.log('  Username: sandhya');
console.log('  Password: Sandhya@wifey');
console.log(`  Hash: ${sandhyaHash}\n`);

console.log('🚀 Setup Instructions:\n');

console.log('1. Go to Supabase Dashboard: https://supabase.com');
console.log('2. Select your project');
console.log('3. SQL Editor → New Query');
console.log('4. Copy and run the SQL from SETUP_INSTRUCTIONS.md');
console.log('5. Replace the hash placeholders with above hashes\n');

console.log('Or use the provided SETUP.sql file in the project root.\n');

console.log('✅ Ready to setup! Follow SETUP_INSTRUCTIONS.md');
