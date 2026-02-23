
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rudolmemxsugxmcbvrwe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking data in 'call_logs'...");
    const { data, error, count } = await supabase
        .from('call_logs')
        .select('*, clients(*)', { count: 'exact' });

    if (error) {
        console.error("Error fetching call_logs:", error);
    } else {
        console.log("Success! Found " + (count || 0) + " records.");
        if (data && data.length > 0) {
            console.log("First record sample (mapped):", JSON.stringify({
                id: data[0].id,
                sentiment: data[0].sentiment,
                status: data[0].status,
                client: data[0].clients ? (Array.isArray(data[0].clients) ? data[0].clients[0] : data[0].clients) : null
            }, null, 2));
        }
    }
}

checkData();
