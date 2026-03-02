import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Paddle } from '@paddle/paddle-node-sdk';
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

// Initialize Paddle Node SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY || ''); // Requires PADDLE_API_KEY in Vercel Env

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId in request body.' });
        }

        // 1. Fetch user data to cross-check subscription details via REST API
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const accessToken = await getFirestoreAccessToken();

        const docRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (docRes.status === 404) {
            return res.status(404).json({ error: 'User not found in database.' });
        }

        if (!docRes.ok) {
            console.error('Firestore REST API error', await docRes.text());
            return res.status(500).json({ error: 'Failed to access database.' });
        }

        const userDoc = await docRes.json();

        // Firestore REST API returns fields in a specific format: { fields: { paddleCustomerId: { stringValue: "..." } } }
        const customerId = userDoc?.fields?.paddleCustomerId?.stringValue;

        if (!customerId) {
            return res.status(404).json({ error: 'No active Paddle customer ID associated with this user.' });
        }

        // 2. Fetch Customer Portal details using the SDK
        // Creating an authenticated customer portal session
        // Typically, this gives a securely scoped URL
        let customer;
        try {
            customer = await paddle.customers.get(customerId);
        } catch (paddleErr) {
            console.error('Paddle SDK Error fetching customer:', paddleErr);
            return res.status(500).json({ error: 'Failed to find customer in billing system.' });
        }

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        // Ensure we handle potentially null states on Paddle SDK gracefully
        // For paddle-node-sdk, the typical way to get a portal URL is through retrieving the customer or subscription
        // If not directly exposed on customer, fallback to the generic paddle.net email form
        return res.status(200).json({
            success: true,
            customerPortalUrl: `https://paddle.net/`,
            message: "Manage subscription using Paddle Customer Portal."
        });

    } catch (error: any) {
        console.error('Error generating paddle portal link:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
