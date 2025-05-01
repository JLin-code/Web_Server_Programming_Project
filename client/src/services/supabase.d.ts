declare module '../services/supabase' {
  interface SupabaseUser {
    email: string;
    id?: string;
  }

  interface SupabaseSession {
    user: SupabaseUser;
  }

  interface SupabaseAuthResponse {
    data: {
      session: SupabaseSession | null;
      user: SupabaseUser | null;
    };
    error: SupabaseError | null;
  }

  interface SupabaseError {
    message: string;
    details?: unknown;
  }

  interface SupabaseQueryResponse<T> {
    data: T | null;
    error: SupabaseError | null;
    signOut(): Promise<{ error: SupabaseError | null }>;
  }

  interface SupabaseAuth {
    getSession(): Promise<SupabaseAuthResponse>;
    signInWithPassword(credentials: { email: string; password: string }): Promise<SupabaseAuthResponse>;
    signOut(): Promise<{ error: SupabaseError | null }>;
  }

  interface SupabaseQueryBuilder<T> {
    select(columns: string): SupabaseQueryBuilder<T>;
    eq<V>(column: string, value: V): SupabaseQueryBuilder<T>;
    single(): Promise<SupabaseQueryResponse<T>>;
    limit(count: number): SupabaseQueryBuilder<T>;
  }

  interface Supabase {
    auth: SupabaseAuth;
    from<T>(table: string): SupabaseQueryBuilder<T>;
  }

  export const supabase: Supabase;
  export default supabase;
  
  export const supabaseUsers: {
    getAll(): Promise<{ items: SupabaseUser[]; total: number }>;
    getById(id: string): Promise<SupabaseUser>;
  };
}
