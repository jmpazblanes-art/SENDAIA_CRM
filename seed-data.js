
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    console.log("Seeding test data...");
    const { data: clients } = await supabase.from('clients').select('id').limit(1);

    let clientId = null;
    if (clients && clients.length > 0) {
        clientId = clients[0].id;
    } else {
        // Create a dummy client first
        const { data: newClient, error: clientError } = await supabase.from('clients').insert({
            first_name: 'Test',
            last_name: 'User',
            company_name: 'Demo Corp',
            status: 'lead'
        }).select();
        if (clientError) console.error("Error creating test client:", clientError);
        clientId = newClient ? newClient[0].id : null;
    }

    if (!clientId) {
        console.error("Could not get or create a client id.");
        return;
    }

    const { error } = await supabase.from('call_logs').insert({
        call_sid: 'test_' + Date.now(),
        client_id: clientId,
        status: 'completed',
        transcript: 'This is a test transcript and it should appear in the CRM.',
        summary: 'Positive interaction with Demo Corp.',
        sentiment: 'Positive',
        direction: 'outbound',
        duration: 125
    });

    if (error) {
        console.error("Error seeding call_logs:", error);
    } else {
        console.log("Successfully seeded 1 test call log linked to client " + clientId);
    }
}

seed();
