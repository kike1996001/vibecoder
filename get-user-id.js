/**
 * Obtiene el ID real del usuario desde Supabase
 * basándose en el email
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://teedklgztytpogkjbtva.supabase.co';
const supabaseKey = 'sb_secret_TuU52WQwhRrYXYbqwEBIOA_vxLm6s-p'; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserIdByEmail(email) {
  try {
    console.log(`🔍 Buscando usuario con email: ${email}...`);
    
    // Get user from Auth
    const { data: userData, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error listing users:', error);
      return null;
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ No se encontró usuario con email: ${email}`);
      console.log('\nUsuarios disponibles:');
      userData.users.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u.id})`);
      });
      return null;
    }

    console.log(`✅ Usuario encontrado!`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    
    return user.id;
  } catch (err) {
    console.error('Error:', err.message);
    return null;
  }
}

const userEmail = 'delinafachemabebeda@gmail.com';
const userId = await getUserIdByEmail(userEmail);

if (userId) {
  console.log(`\n✅ Usa este ID en tu webhook: "${userId}"`);
}
