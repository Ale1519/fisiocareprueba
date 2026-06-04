import { createClient } from '@supabase/supabase-js';

// Jalamos las variables de entorno que configuramos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializamos el cliente de Supabase para toda la app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
