import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// These are safe to expose (anon key has limited permissions via RLS)
const SUPABASE_URL = "https://teedklgztytpogkjbtva.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWRrbGd6dHl0cG9na2pidHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyMDkxOTgsImV4cCI6MTcyODc2MTE5OH0.eVKn98KrWRGVZM65b3IVvkLvcsm-q0JQzKJ6v80LqG0";

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