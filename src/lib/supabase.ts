import { createClient } from '@supabase/supabase-js';
import type { LeadEmailData } from './email';

function getSupabaseClient() {
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

export async function insertLead(data: LeadEmailData): Promise<void> {
    const client = getSupabaseClient();

    if (!client) {
        console.log('[supabase] No credentials configured – skipping DB insert');
        return;
    }

    const { error } = await client.from('leads').insert([
        {
            vorname: data.vorname,
            nachname: data.nachname,
            email: data.email,
            telefon: data.telefon ?? null,
            plz: data.plz ?? null,
            gebaeudetyp: data.gebaeudetyp ?? null,
            baujahr: data.baujahr ?? null,
            bereiche: data.bereiche ?? null,
            kaufmotive: data.kaufmotive ?? null,
            pain_points: data.painPoints ?? null,
            budget: data.budget ?? null,
            zeitplanung: data.zeitplanung ?? null,
            submitted_at: new Date().toISOString(),
            source: 'smarthome-konfigurator'
        }
    ]);

    if (error) {
        console.error('[supabase] Insert failed:', error.message);
        throw error;
    }
}
