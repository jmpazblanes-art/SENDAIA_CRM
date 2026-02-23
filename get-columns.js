
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rudolmemxsugxmcbvrwe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZG9sbWVteHN1Z3htY2J2cndlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYxNzMzNCwiZXhwIjoyMDg2MTkzMzM0fQ.As1mEEtdHfWobHGFrkNlFURogj6mNU356KMTEKqufvg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getColumns() {
    console.log("Getting columns for call_logs...");

    // Using postgres query via rpc if available, or just raw query
    // Supabase allows querying views/tables in public schema
    const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .limit(0); // This should return metadata if supported, but let's try something else

    if (error) {
        console.error("Error:", error);
    } else {
        // In some clients, this might show column info in some property
        console.log("Data structure:", data);
    }

    // Try information_schema
    const { data: cols, error: colsErr } = await supabase
        .rpc('get_table_columns', { table_name: 'call_logs' }); // unlikely to exist but worth a shot

    if (colsErr) {
        // Try direct query if service role allows (it doesn't usually through PostgREST unless exposed)
        console.log("Information schema query via RPC failed, trying to insert a dummy and rollback? No.");
    } else {
        console.log("Columns:", cols);
    }
}

getColumns();
