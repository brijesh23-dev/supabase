import { createClient} from "@supabase/supabase-js";

const supabaseUrl = 'https://lpruwnfxdtwjicpofsot.supabase.co'
const supabaseKey='sb_publishable_5JbVP_txjPjtNLIgGwcZCw_FHiWdqip';
export const supabase = createClient(supabaseUrl,supabaseKey);
