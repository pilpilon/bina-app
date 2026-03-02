import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines if any
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

const db = getFirestore();

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
        // A subscription was created or updated successfully
        console.log(`Subscription created/updated! userId: ${userId}`);
        if (userId) {
          const status = event.data?.status;
          const customerId = event.data?.customer_id;
          const subscriptionId = event.data?.id;
          // You might need to map price IDs to your app's tiers (e.g., 'plus' or 'pro')
          // For now, we'll extract the tier directly if it was passed in customData, or default to a logic
          const mappedTier = customData.tier || 'pro';

          if (status === 'active' || status === 'trialing') {
            await db.collection('users').doc(userId).update({
              tier: mappedTier,
              paddleCustomerId: customerId,
              paddleSubscriptionId: subscriptionId
            });
            console.log(`Updated user ${userId} to ${mappedTier} tier.`);
          }
        }
        break;

      case 'subscription.canceled':
        // A subscription has been canceled
        console.log(`Subscription canceled! restoring to 'free'. userId: ${userId}`);
        if (userId) {
          // Update the user document to reflect the free tier
          await db.collection('users').doc(userId).update({
            tier: 'free',
            // Maintain historical data but unset active subs
            paddleSubscriptionId: null
          });
          console.log(`Updated user ${userId} back to free tier following cancellation.`);
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
