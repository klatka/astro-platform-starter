import type { APIRoute } from 'astro';
import { sendLeadConfirmation, type LeadEmailData } from '../../lib/email';
import { insertLead } from '../../lib/supabase';

export const prerender = false;

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
            const webhookRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    source: 'smarthome-konfigurator',
                    data: body
                })
            });
            if (!webhookRes.ok) {
                console.error('Webhook responded with status', webhookRes.status);
            }
        } catch (err) {
            console.error('Webhook delivery failed:', err);
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
