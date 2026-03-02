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

// HMAC signature verification for Paddle webhooks using Web Crypto
async function verifySignature(req: Request, payload: string, secret: string): Promise<boolean> {
  try {
    const signatureHeader = req.headers.get('paddle-signature');
    if (!signatureHeader) return false;

    const parts = signatureHeader.split(';');
    let ts = '';
    let signature = '';
    for (const part of parts) {
      if (part.startsWith('ts=')) ts = part.substring(3);
      if (part.startsWith('h1=')) signature = part.substring(3);
    }

    if (!ts || !signature) return false;

    // Construct the signed payload string
    const signedPayload = `${ts}:${payload}`;

    // Create HMAC SHA256 using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const expectedSignature = Array.from(new Uint8Array(sigBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time compare
    if (signature.length !== expectedSignature.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error('Signature verification failed', error);
    return false;
  }
}

// Basic Webhook schema
type PaddleWebhook = {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: any;
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await req.json();
  const payloadStr = JSON.stringify(body);
  const signatureKey = process.env.PADDLE_WEBHOOK_SECRET;

  if (!signatureKey) {
    console.error('Missing PADDLE_WEBHOOK_SECRET in environment variables.');
    return new Response('Webhook secret not configured.', { status: 500 });
  }

  // Verify the event signature
  if (!(await verifySignature(req, payloadStr, signatureKey))) {
    console.error('Invalid signature');
    return new Response('Invalid signature', { status: 401 });
  }

  const event = body as PaddleWebhook;
  console.log(`Received Paddle event: ${event.event_type} (${event.event_id})`);

  try {
    const customData = event.data?.custom_data || {};
    const userId = customData.userId;

    if (!userId) {
      console.warn('Webhook received but no userId found in custom_data.');
    }

    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.updated': {
        console.log(`Subscription created/updated! userId: ${userId}`);
        if (userId) {
          const status = event.data?.status;
          const customerId = event.data?.customer_id;
          const subscriptionId = event.data?.id;
          const mappedTier = customData.tier || 'pro';

          if (status === 'active' || status === 'trialing') {
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const accessToken = await getFirestoreAccessToken();

            const payload = {
              fields: {
                tier: { stringValue: mappedTier },
                paddleCustomerId: { stringValue: customerId },
                paddleSubscriptionId: { stringValue: subscriptionId }
              }
            };

            await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=tier&updateMask.fieldPaths=paddleCustomerId&updateMask.fieldPaths=paddleSubscriptionId`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
            console.log(`Updated user ${userId} to ${mappedTier} tier via REST.`);
          }
        }
        break;
      }

      case 'subscription.canceled': {
        console.log(`Subscription canceled! restoring to 'free'. userId: ${userId}`);
        if (userId) {
          const projectId = process.env.FIREBASE_PROJECT_ID;
          const accessToken = await getFirestoreAccessToken();

          const payload = {
            fields: {
              tier: { stringValue: 'free' },
              paddleSubscriptionId: { nullValue: null }
            }
          };

          await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=tier&updateMask.fieldPaths=paddleSubscriptionId`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          console.log(`Updated user ${userId} back to free tier following cancellation via REST.`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
