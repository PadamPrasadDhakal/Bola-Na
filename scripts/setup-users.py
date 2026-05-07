#!/usr/bin/env python3
"""
Bola Na - User Setup Script
Generates bcrypt password hashes for Sohan and Sandhya
"""

try:
    import bcrypt
except ImportError:
    print("❌ bcrypt not installed")
    print("Install with: pip install bcrypt")
    exit(1)

def generate_hash(password):
    """Generate bcrypt hash for password"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')

# Generate hashes
sohan_hash = generate_hash("Sohan@husband")
sandhya_hash = generate_hash("Sandhya@wifey")

print("🔐 Bola Na - User Setup")
print("=" * 70)
print()

print("📋 Generated Password Hashes:")
print()
print(f"User 1: Sohan")
print(f"  Password: Sohan@husband")
print(f"  Hash: {sohan_hash}")
print()

print(f"User 2: Sandhya")
print(f"  Password: Sandhya@wifey")
print(f"  Hash: {sandhya_hash}")
print()

print("=" * 70)
print()

print("💾 SQL to run in Supabase SQL Editor:")
print()

sql = f"""-- Create users for Bola Na
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES 
  ('sohan', '{sohan_hash}', 'Sohan', 'https://api.multiavatar.com/sohan.png'),
  ('sandhya', '{sandhya_hash}', 'Sandhya', 'https://api.multiavatar.com/sandhya.png')
ON CONFLICT (username) DO NOTHING;

-- Verify
SELECT username, display_name FROM users WHERE username IN ('sohan', 'sandhya');
"""

print(sql)
print()

print("✅ Copy the SQL above and run it in Supabase Dashboard")
print("🚀 Then run: npm install && npm run dev")
