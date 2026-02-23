
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rudolmemxsugxmcbvrwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZG9sbWVteHN1Z3htY2J2cndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczMzQsImV4cCI6MjA4NjE5MzMzNH0.tUCe5r_fyCnQNyHwi5H-eP8RKA-CUYAFguSk1pwCTlM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing connection to Supabase...");

    // 1. Test table existence
    const { data: call_logs, error: logsError } = await supabase
        .from('call_logs')
        .select('*')
        .limit(1);

    if (logsError) {
        console.error("Error fetching call_logs:", logsError);
    } else {
        console.log("Successfully fetched call_logs:", call_logs);
    }

    // 2. Test relation to clients
    const { data: callsWithClients, error: relationError } = await supabase
        .from('call_logs')
        .select(`
            *,
            clients (
                first_name,
                last_name,
                company_name,
                industry
            )
        `)
        .limit(1);

    if (relationError) {
        console.error("Error fetching call_logs with clients relation:", relationError);
    } else {
        console.log("Successfully fetched call_logs with clients relation:", callsWithClients);
    }
}

testConnection();
