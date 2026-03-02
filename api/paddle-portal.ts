export const config = {
    runtime: 'edge',
};

// Helper to base64url encode
function base64url(input: string): string {
    return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlFromBuffer(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Convert PEM private key to CryptoKey for Web Crypto API
async function importPrivateKey(pem: string): Promise<CryptoKey> {
    const pemContents = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
        .replace(/-----END RSA PRIVATE KEY-----/g, '')
        .replace(/\s/g, '');

    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return crypto.subtle.importKey(
        'pkcs8',
        bytes.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );
}

// Generate a Google Cloud JWT for Firestore REST API using Web Crypto
async function getGoogleAuthToken(clientEmail: string, privateKeyPem: string): Promise<string> {
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const claim = base64url(JSON.stringify({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/datastore',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    }));

    const signatureInput = `${header}.${claim}`;
    const key = await importPrivateKey(privateKeyPem);
    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(signatureInput)
    );

    return `${signatureInput}.${base64urlFromBuffer(signature)}`;
}

async function getFirestoreAccessToken(): Promise<string> {
    const jwt = await getGoogleAuthToken(
        process.env.FIREBASE_CLIENT_EMAIL || '',
        (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    );

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });
    const data = await res.json();
    return data.access_token;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId in request body.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 1. Fetch user data from Firestore REST API
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const accessToken = await getFirestoreAccessToken();

        const docRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (docRes.status === 404) {
            return new Response(JSON.stringify({ error: 'User not found in database.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        if (!docRes.ok) {
            console.error('Firestore REST API error', await docRes.text());
            return new Response(JSON.stringify({ error: 'Failed to access database.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const userDoc = await docRes.json();
        const customerId = userDoc?.fields?.paddleCustomerId?.stringValue;

        if (!customerId) {
            return new Response(JSON.stringify({ error: 'No active Paddle customer ID associated with this user.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Fetch Customer from Paddle REST API
        const paddleRes = await fetch(`https://api.paddle.com/customers/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!paddleRes.ok) {
            console.error('Paddle API Error:', await paddleRes.text());
            return new Response(JSON.stringify({ error: 'Failed to find customer in billing system.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const paddleData = await paddleRes.json();
        const customer = paddleData.data;

        if (!customer) {
            return new Response(JSON.stringify({ error: 'Customer not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
            success: true,
            customerPortalUrl: `https://paddle.net/`,
            message: "Manage subscription using Paddle Customer Portal."
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error('Error generating paddle portal link:', error.message);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
