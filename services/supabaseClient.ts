import { createClient } from '@supabase/supabase-js';

// Estas variables las obtendrás de tu proyecto en Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Inicializando Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NO CONFIGURADA');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Credenciales de Supabase no configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la base de datos
export interface DBCourse {
  id: string;
  user_id?: string;
  created_at: number;
  last_updated: number;
  step: string;
  topic: string;
  related_topics: string[];
  pillars: any[];
  selected_pillar?: any;
  variations: any[];
  selected_variation?: any;
  course?: any;
  depth: string;
  completed_module_ids: string[];
  user_highlights: Record<string, string[]>;
  quiz_results: Record<string, { score: number; total: number }>;
}
