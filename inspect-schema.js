
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rudolmemxsugxmcbvrwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZG9sbWVteHN1Z3htY2J2cndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczMzQsImV4cCI6MjA4NjE5MzMzNH0.tUCe5r_fyCnQNyHwi5H-eP8RKA-CUYAFguSk1pwCTlM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("Inspecting call_logs schema...");

    // Attempt to get one record to see structure
    const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Columns found:", data.length > 0 ? Object.keys(data[0]) : "No data to inspect columns");
    }
}

inspectSchema();
