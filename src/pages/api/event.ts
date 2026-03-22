import type { APIRoute } from 'astro';
import { insertConfiguratorEvent } from '../../lib/supabase';

export const prerender = false;

interface EventBody {
    type: 'configurator_opened' | 'configurator_abandoned';
    step?: number;
    stepName?: string;
}

function buildDiscordPayload(event: EventBody): object {
    if (event.type === 'configurator_opened') {
        return {
            embeds: [
                {
                    title: '🚀 Konfigurator gestartet',
                    description: 'Ein Besucher hat den Smart Home Konfigurator geöffnet.',
                    color: 0x00c7fb,
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    const stepLabel =
        event.stepName && event.step !== undefined
            ? `Schritt ${event.step + 1} – ${event.stepName}`
            : event.stepName ?? (event.step !== undefined ? `Schritt ${event.step + 1}` : 'Unbekannt');

    return {
        embeds: [
            {
                title: '⚠️ Konfigurator verlassen',
                description:
                    'Ein Besucher hat den Konfigurator verlassen ohne ein Angebot anzufordern.',
                color: 0xff8c00,
                fields: [{ name: 'Letzter Schritt', value: stepLabel, inline: true }],
                timestamp: new Date().toISOString()
            }
        ]
    };
}

export const POST: APIRoute = async ({ request }) => {
    let body: EventBody;
    try {
        body = (await request.json()) as EventBody;
    } catch {
        return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const webhookUrl = import.meta.env.WEBHOOK_URL;

    if (webhookUrl) {
        try {
            const payload = buildDiscordPayload(body);
            const webhookRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!webhookRes.ok) {
                console.error('[event] Webhook responded with status', webhookRes.status);
            }
        } catch (err) {
            console.error('[event] Webhook delivery failed:', err);
        }
    } else {
        console.log('[event] No WEBHOOK_URL configured – event data:', JSON.stringify(body));
    }

    // Persist event to Supabase (non-blocking – failure does not affect the response)
    try {
        await insertConfiguratorEvent({
            event_type: body.type,
            step: body.step,
            step_name: body.stepName
        });
    } catch (err) {
        console.error('[event] Supabase insert error:', err);
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
