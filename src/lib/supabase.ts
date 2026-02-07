
import { createClient } from '@supabase/supabase-js';

// These should be in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe client creation that won't crash if keys are missing
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => ({ 
            select: () => ({ 
                order: () => ({ 
                    limit: () => ({ 
                        single: async () => ({ data: null, error: 'Supabase not configured' }) 
                    }) 
                }) 
            }), 
            insert: async () => ({ error: 'Supabase not configured' }) 
        }),
        channel: () => ({ 
            on: () => ({ 
                subscribe: () => ({ unsubscribe: () => {} }) 
            }) 
        }),
        removeChannel: () => {}
      } as any;

// Type definition for our stored token data
export interface StoredTokenData {
    mint: string;
    name: string;
    symbol: string;
    image_uri?: string;
    detected_at?: string;
}
