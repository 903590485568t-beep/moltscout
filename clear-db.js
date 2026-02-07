
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmxvouezcippswywliil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteHZvdWV6Y2lwcHN3eXdsaWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIxNjgsImV4cCI6MjA4NjA0ODE2OH0.fZTsZDiZkHELYcTK_1zrYRH3x9CTq0PeRc70mpKiiNI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDb() {
  console.log('Clearing official_token table...');
  const { error } = await supabase
    .from('official_token')
    .delete()
    .neq('mint', '0'); // Delete everything where mint is not 0 (effectively all)
    
  if (error) {
    console.error('Error clearing DB:', error);
  } else {
    console.log('Database cleared successfully!');
  }
}

clearDb();
