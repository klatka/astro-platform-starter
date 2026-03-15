import type { APIRoute } from 'astro';

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

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
