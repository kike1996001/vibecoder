import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = 'e6606ad0-3ebf-4208-a059-ff8797a76252';

console.log('🔍 Checando tabla user_credits...\n');

const { data, error } = await supabase
  .from('user_credits')
  .select('*')
  .eq('user_id', userId)
  .single();

if (error) {
  console.log('❌ Error:', error.message);
  console.log('\n💡 Probablemente NO existe entrada para este usuario en user_credits');
  console.log('   Necesitamos crear una entrada con balance 0\n');
} else {
  console.log('✅ Usuario encontrado:');
  console.log(JSON.stringify(data, null, 2));
}
