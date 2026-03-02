import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

// Helper to generate a Google Cloud JWT for Firestore REST API
function getGoogleAuthToken(clientEmail: string, privateKey: string): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodeBase64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signatureInput = `${encodeBase64(header)}.${encodeBase64(claim)}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(privateKey, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

async function getFirestoreAccessToken(): Promise<string> {
  const jwt = getGoogleAuthToken(
    process.env.FIREBASE_CLIENT_EMAIL || '',
    (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  return data.access_token;
}

// Basic Webhook schema
type PaddleWebhook = {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: any;
};

function verifySignature(request: VercelRequest, payload: string, secret: string): boolean {
  try {
    const signatureHeader = request.headers['paddle-signature'] as string;
    if (!signatureHeader) return false;

    // Extract ts and h1 properties from the signature header
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

    // Create a HMAC SHA256 signature using the secret key
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const expectedSignature = hmac.digest('hex');

    // Secure compare
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification failed', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const payloadStr = JSON.stringify(req.body);
  const signatureKey = process.env.PADDLE_WEBHOOK_SECRET;

  if (!signatureKey) {
    console.error('Missing PADDLE_WEBHOOK_SECRET in environment variables.');
    return res.status(500).send('Webhook secret not configured.');
  }

  // Verify the event signature
  if (!verifySignature(req, payloadStr, signatureKey)) {
    console.error('Invalid signature');
    return res.status(401).send('Invalid signature');
  }

  const event = req.body as PaddleWebhook;
  console.log(`Received Paddle event: ${event.event_type} (${event.event_id})`);

  try {
    // We expect the frontend to have passed the Firebase UID in customData
    const customData = event.data?.custom_data || {};
    const userId = customData.userId;

    if (!userId) {
      console.warn('Webhook received but no userId found in custom_data.');
    }

    // Process specific events
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.updated':
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

      case 'subscription.canceled':
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

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return res.status(200).send('Webhook processed');
  } catch (error: any) {
    console.error('Error processing webhook:', error.message);
    return res.status(500).send('Internal Server Error');
  }
}
