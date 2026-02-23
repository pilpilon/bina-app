import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

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
      case 'transaction.completed':
        // A payment was successful
        console.log(`Transaction completed! userId: ${userId}`);
        
        // TODO: In a real app with firebase-admin installed via npm, you would do:
        // import * as admin from 'firebase-admin';
        // await admin.firestore().collection('users').doc(userId).update({ tier: 'pro' });
        
        // As a workaround, since firebase-admin npm install fails contextually, 
        // we log the success here. Note that Firebase handles read/writes on the client usually, 
        // but for server-side updates Firebase Admin SDK is required.
        break;
      
      case 'subscription.created':
        console.log(`Subscription created! userId: ${userId}`);
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
