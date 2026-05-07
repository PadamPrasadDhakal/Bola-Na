import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xntjgqzyytisiuphtibw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xKdFZt0fhALc0GBp6pXyMA_qaLJPVSt';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Hash passwords
    const sohanPasswordHash = bcrypt.hashSync('Sohan@husband', 10);
    const sandhyaPasswordHash = bcrypt.hashSync('Sandhya@wifey', 10);

    console.log('✓ Passwords hashed');

    // Insert users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          username: 'sohan',
          password_hash: sohanPasswordHash,
          display_name: 'Sohan',
          profile_picture: 'https://api.multiavatar.com/sohan.png',
          is_online: false,
        },
        {
          username: 'sandhya',
          password_hash: sandhyaPasswordHash,
          display_name: 'Sandhya',
          profile_picture: 'https://api.multiavatar.com/sandhya.png',
          is_online: false,
        },
      ])
      .select();

    if (usersError) {
      console.error('❌ Error creating users:', usersError.message);
      return;
    }

    console.log('✓ Users created successfully');
    console.log('\n📋 Created Users:');
    users?.forEach((user) => {
      console.log(`  • ${user.display_name} (@${user.username})`);
    });

    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Login credentials:');
    console.log('  User 1: sohan / Sohan@husband');
    console.log('  User 2: sandhya / Sandhya@wifey');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDatabase();
