import { loadStripe } from '@stripe/stripe-js';

// TO THE USER: Replace with your actual Stripe Publishable Key
const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_KEY_HERE";

export const getStripe = () => loadStripe(STRIPE_PUBLISHABLE_KEY);

export const redirectToCheckout = async (priceId: string) => {
    const stripe = await getStripe();
    if (!stripe) throw new Error("Stripe failed to initialize");

    // In a real production app, you would call your backend here to create a checkout session.
    // For now, we'll log it for the user to see where the integration happens.
    console.log(`Redirecting to Stripe Checkout for price: ${priceId}`);

    // Example of what the real call would look like:
    /*
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });
    const session = await res.json();
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
    */

    alert("נשלחת לדף תשלום מאובטח של Stripe (בגרסת הדמו)");
};
