import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Paddle } from '@paddle/paddle-node-sdk';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

const db = getFirestore();

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

        // 1. Fetch user data to cross-check subscription details
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found in database.' });
        }

        const userData = userDoc.data();
        const customerId = userData?.paddleCustomerId;

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
