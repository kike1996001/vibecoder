import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// These are safe to expose (anon key has limited permissions via RLS)
const SUPABASE_URL = "https://teedklgztytpogkjbtva.supabase.co";
const SUPABASE_KEY = "sb_publishable_goLj7l6-C3n6vKxdFjst_w_82W7PRUn";

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});

// Helper functions
export async function signInWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});
	return { data, error };
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

export async function getCurrentUser() {
	const { data: { user } } = await supabase.auth.getUser();
	return user;
}