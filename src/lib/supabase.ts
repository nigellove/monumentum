import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  description: string | null;
}

export interface UserProduct {
  id: string;
  user_id: string;
  product_name: string;
  product_id: string;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  price: string;
  description: string | null;
  config_data: Record<string, any> | null;
  ai_prompt: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  billing_cycle: string | null;
  trial_ends_at: string | null;
  platform: string | null;
  widget_url: string | null;
}
