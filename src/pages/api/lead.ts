import type { APIRoute } from 'astro';
import { sendLeadConfirmation, type LeadEmailData } from '../../lib/email';
import { insertLead, insertConfiguratorEvent } from '../../lib/supabase';

export const prerender = false;

function buildLeadDiscordPayload(lead: LeadEmailData): object {
    const name = [lead.vorname, lead.nachname].filter(Boolean).join(' ') || '–';
    const fields = [
        { name: 'Name', value: name, inline: true },
        { name: 'E-Mail', value: lead.email || '–', inline: true }
    ];
    if (lead.telefon) fields.push({ name: 'Telefon', value: lead.telefon, inline: true });
    if (lead.plz) fields.push({ name: 'PLZ', value: lead.plz, inline: true });
    if (lead.gebaeudetyp) fields.push({ name: 'Gebäudetyp', value: lead.gebaeudetyp, inline: true });
    if (lead.baujahr) fields.push({ name: 'Baujahr', value: lead.baujahr, inline: true });
    if (lead.bereiche?.length) fields.push({ name: 'Bereiche', value: lead.bereiche.join(', '), inline: false });
    if (lead.kaufmotive?.length) fields.push({ name: 'Motive', value: lead.kaufmotive.join(', '), inline: false });
    if (lead.budget) fields.push({ name: 'Budget', value: lead.budget, inline: true });
    if (lead.zeitplanung) fields.push({ name: 'Zeitplanung', value: lead.zeitplanung, inline: true });

    return {
        embeds: [
            {
                title: '✅ Neues Angebot angefordert',
                description: 'Ein Besucher hat den Konfigurator abgeschlossen und ein Angebot angefordert.',
                color: 0x00c851,
                fields,
                timestamp: new Date().toISOString()
            }
        ]
    };
}

export const POST: APIRoute = async ({ request }) => {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const webhookUrl = import.meta.env.WEBHOOK_URL;

    if (webhookUrl) {
        try {
            const payload = buildLeadDiscordPayload(body as LeadEmailData);
            const webhookRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!webhookRes.ok) {
                console.error('[lead] Webhook responded with status', webhookRes.status);
            }
        } catch (err) {
            console.error('[lead] Webhook delivery failed:', err);
        }
    } else {
        console.log('[lead] No WEBHOOK_URL configured – lead data:', JSON.stringify(body));
    }

    // Persist lead to Supabase (non-blocking – failure does not affect the response)
    const leadData = body as LeadEmailData;

    try {
        await insertLead(leadData);
    } catch (err) {
        console.error('[lead] Supabase insert error:', err);
    }

    // Record a form_submitted event for statistics
    try {
        await insertConfiguratorEvent({ event_type: 'form_submitted' });
    } catch (err) {
        console.error('[lead] Event insert error:', err);
    }

    // Send confirmation email (non-blocking – failure does not affect the response)
    if (leadData?.email) {
        try {
            await sendLeadConfirmation(leadData);
        } catch (err) {
            console.error('[lead] Email delivery failed:', err);
        }
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

