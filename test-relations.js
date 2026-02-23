
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rudolmemxsugxmcbvrwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZG9sbWVteHN1Z3htY2J2cndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczMzQsImV4cCI6MjA4NjE5MzMzNH0.tUCe5r_fyCnQNyHwi5H-eP8RKA-CUYAFguSk1pwCTlM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRelations() {
    console.log("Testing relations for call_logs...");

    // Plural
    const { error: pluralErr } = await supabase
        .from('call_logs')
        .select('*, clients(*)')
        .limit(1);
    console.log("Plural (clients):", pluralErr ? `FAILED: ${pluralErr.message}` : "OK");

    // Singular
    const { error: singularErr } = await supabase
        .from('call_logs')
        .select('*, client(*)')
        .limit(1);
    console.log("Singular (client):", singularErr ? `FAILED: ${singularErr.message}` : "OK");
}

testRelations();
