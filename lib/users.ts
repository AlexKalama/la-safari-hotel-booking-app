import { supabaseClient, supabaseAdmin } from './supabase';

export type UserRole = 'user' | 'admin';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

/**
 * Create a new user in the database
 */
export async function createUser(userData: {
  id: string;
  email: string;
  role?: UserRole;
}): Promise<UserData | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        id: userData.id,
        email: userData.email,
        role: userData.role || 'user',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
}

/**
 * Get a user by their ID
 */
export async function getUserById(id: string): Promise<UserData | null> {
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

/**
 * Update a user's role
 */
export async function updateUserRole(id: string, role: UserRole): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', id);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  return true;
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(id: string): Promise<boolean> {
  const user = await getUserById(id);
  return user?.role === 'admin';
}
