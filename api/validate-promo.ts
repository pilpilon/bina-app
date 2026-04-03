export const config = {
    runtime: 'edge',
};

const VALID_CODES: Record<string, { tier: string; message: string }> = {
    'BINA-PRO-2026': { tier: 'pro', message: '✨ קוד תקין! Bina Pro נפתח עבורך ללא הגבלה.' },
    'BINA-GIFT-FREE': { tier: 'pro', message: '✨ קוד תקין! Bina Pro נפתח עבורך ללא הגבלה.' },
    'BINA-PLUS-2026': { tier: 'plus', message: '✨ קוד תקין! Bina Plus נפתח עבורך ללא הגבלה.' },
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { code, userId } = await req.json();

        if (!code || typeof code !== 'string') {
            return new Response(JSON.stringify({ valid: false, error: '❌ קוד לא תקין.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!userId) {
            return new Response(JSON.stringify({ valid: false, error: '❌ יש להתחבר כדי להפעיל קוד.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const upperCode = code.trim().toUpperCase();
        const match = VALID_CODES[upperCode];

        if (match) {
            console.log(`Promo code ${upperCode} applied for user ${userId} -> ${match.tier}`);
            return new Response(JSON.stringify({ valid: true, tier: match.tier, message: match.message }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ valid: false, error: '❌ קוד לא תקין. נסה שוב.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch {
        return new Response(JSON.stringify({ valid: false, error: '❌ שגיאה פנימית.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
