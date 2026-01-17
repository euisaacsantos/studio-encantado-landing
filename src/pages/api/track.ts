import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, clientAddress }) => {
    const data = await request.json();
    const pixelId = process.env.META_PIXEL_ID || import.meta.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN || import.meta.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
        return new Response(JSON.stringify({ error: 'Missing Meta credentials' }), { status: 500 });
    }

    const eventData = {
        data: [
            {
                event_name: data.eventName || 'Contact',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_source_url: data.url,
                user_data: {
                    client_user_agent: data.userAgent,
                    client_ip_address: clientAddress,
                },
                custom_data: {
                    content_name: data.unitName,
                    content_category: 'Lead',
                },
            }
        ]
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), { status: response.status });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to send to Meta' }), { status: 500 });
    }
};
