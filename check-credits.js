/**
 * Verifica el balance de créditos del usuario
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://teedklgztytpogkjbtva.supabase.co';
const supabaseKey = 'sb_secret_TuU52WQwhRrYXYbqwEBIOA_vxLm6s-p'; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserCredits(userId) {
  try {
    console.log(`📊 Verificando balance de créditos para usuario: ${userId}`);
    
    // Get current balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (balanceError) {
      console.error('❌ Error fetching balance:', balanceError);
      return;
    }

    console.log(`✅ Balance actual: ${balance.balance} créditos`);

    // Get transaction history
    console.log('\n📋 Historial de transacciones:');
    const { data: history, error: historyError } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (historyError) {
      console.error('❌ Error fetching history:', historyError);
      return;
    }

    history.forEach(tx => {
      const sign = tx.amount > 0 ? '+' : '';
      const date = new Date(tx.created_at).toLocaleString();
      console.log(`  ${date} | ${sign}${tx.amount} | ${tx.transaction_type} | ${tx.description || ''}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

const userId = 'e6606ad0-3ebf-4208-a059-ff8797a76252'; // Tu ID real
await checkUserCredits(userId);
