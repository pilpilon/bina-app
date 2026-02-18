// Paddle Payment Integration Utility

// TO THE USER: 
// 1. Get your Client-side Token from: Paddle Dashboard > Developer Tools > Authentication
// 2. Paste it below
export const PADDLE_CLIENT_TOKEN = "YOUR_PADDLE_CLIENT_TOKEN_HERE";

// Initialize Paddle
export const initializePaddle = () => {
    if (typeof window !== 'undefined' && (window as any).Paddle) {
        (window as any).Paddle.Initialize({
            token: PADDLE_CLIENT_TOKEN,
            // environment: 'sandbox' // Uncomment this for testing
        });
    }
};

export const openPaddleCheckout = (priceId: string, email?: string) => {
    if (!(window as any).Paddle) {
        alert("שגיאה בטעינת מערכת התשלומים. אנא נסה שוב מאוחר יותר.");
        return;
    }

    (window as any).Paddle.Checkout.open({
        settings: {
            displayMode: 'overlay',
            theme: 'dark',
            locale: 'en', // Paddle supports limited locales, 'en' is safest
        },
        items: [
            {
                priceId: priceId,
                quantity: 1
            }
        ],
        customer: {
            email: email
        }
    });
};
