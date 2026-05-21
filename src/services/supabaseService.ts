import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface DatabaseSchema {
  tables: TableDefinition[];
  enums?: EnumDefinition[];
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  relationships?: Relationship[];
  rls_enabled: boolean;
  policies?: Policy[];
}

export interface EnumDefinition {
  name: string;
  values: string[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  isPrimary?: boolean;
  isForeignKey?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface Policy {
  name: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  using?: string;
  with_check?: string;
}

export const supabaseService = {
  // Auth
  async signUp(email: string, password: string, metadata?: object) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Database Operations
  async createTable(schema: TableDefinition) {
    // Generar SQL DDL
    const columns = schema.columns.map((col) => {
      let def = `${col.name} ${col.type}`;
      if (!col.nullable) def += ' NOT NULL';
      if (col.default) def += ` DEFAULT ${col.default}`;
      if (col.isPrimary) def += ' PRIMARY KEY';
      return def;
    });

    const sql = `
      CREATE TABLE IF NOT EXISTS ${schema.name} (
        ${columns.join(',\n        ')}
      );
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;

    // Enable RLS if requested
    if (schema.rls_enabled) {
      await this.enableRLS(schema.name);
    }

    // Create policies
    if (schema.policies) {
      for (const policy of schema.policies) {
        await this.createPolicy(schema.name, policy);
      }
    }

    return { success: true };
  },

  async enableRLS(tableName: string) {
    const sql = `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`;
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
  },

  async createPolicy(tableName: string, policy: Policy) {
    const sql = `
      CREATE POLICY "${policy.name}"
      ON ${tableName}
      FOR ${policy.action}
      TO authenticated
      ${policy.using ? `USING (${policy.using})` : ''}
      ${policy.with_check ? `WITH CHECK (${policy.with_check})` : ''};
    `;
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
  },

  async insert<T>(table: string, data: Partial<T>) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async select<T>(
    table: string,
    options?: {
      columns?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    }
  ) {
    let query = supabase.from(table).select(options?.columns || '*');

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.single) {
      const { data, error } = await query.single();
      if (error) throw error;
      return data as T;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  },

  async update<T>(table: string, id: string, data: Partial<T>) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // Real-time subscriptions
  subscribe<T>(
    table: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: T;
      old: T;
    }) => void,
    filters?: string
  ) {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filters,
        },
        (payload) => callback(payload as any)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Storage
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
