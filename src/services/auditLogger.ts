import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nixhnbnjernqlgimljmx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peGhuYm5qZXJucWxnaW1sam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNTY4NzksImV4cCI6MjA2NjkzMjg3OX0.G6ka2kLE_Nt7HdSpMld8bNNLfu2Z6oXQBsAB-yQ8l3U';
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface AuditLogEntry {
  action: string;
  workflow_id: string;
  workflow_name?: string;
  old_value?: any;
  new_value?: any;
  user_name: string;
  user_email: string;
  timestamp?: string; // можно не указывать, будет now() на сервере
}

export async function logAuditToSupabase(entry: AuditLogEntry) {
  const { error } = await supabase.from('audit_log').insert([entry]);
  if (error) {
    console.error('Ошибка логирования в Supabase:', error);
  }
}

export async function getLogsForLast14Days() {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .gte('timestamp', since)
    .order('timestamp', { ascending: false });
  if (error) {
    console.error('Ошибка получения логов из Supabase:', error);
    return [];
  }
  return data;
} 