
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// NOTE: In a real production app, this key should be proxied through a backend.
// For the MVP "Bina" app (client-side only), we use it directly.
const genAI = new GoogleGenerativeAI('AIzaSyBOseTkLoEDaO_rnMq1cnSraEDrjGwVuTc');

export interface WritingAnalysis {
    score: number; // 0-100 (60 is pass)
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    vocabularyLevel: 'low' | 'medium' | 'high';
}

export const analyzeWriting = async (text: string): Promise<WritingAnalysis> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
        Act as a professional grader for the Israeli Psychometric Entrance Exam (Pshichometri).
        Analyze the following student essay (Hibbur) written in Hebrew.
        
        The essay topic is generic (argumentative).
        Evaluate based on:
        1. Content (Argument quality, critical thinking, coherence) - 50%
        2. Language (Vocabulary, grammar, register, structure) - 50%

        Return a JSON object ONLY, with this structure:
        {
            "score": number (20-60 scale, normalized to 0-100),
            "feedback": "Concise summary in Hebrew (max 3 sentences)",
            "strengths": ["point 1", "point 2"],
            "weaknesses": ["point 1", "point 2"],
            "vocabularyLevel": "low" | "medium" | "high"
        }

        Essay Text:
        "${text}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Basic clean up of markdown code blocks if present
        const jsonStr = textResponse.replace(/^```json\n|\n```$/g, '').trim();
        const analysis = JSON.parse(jsonStr);

        return {
            score: analysis.score || 70,
            feedback: analysis.feedback || "החיבור נבדק.",
            strengths: analysis.strengths || [],
            weaknesses: analysis.weaknesses || [],
            vocabularyLevel: analysis.vocabularyLevel || 'medium'
        };

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Fallback mock response so user isn't stuck
        return {
            score: 0,
            feedback: "הייתה בעיה בניתוח החיבור. אנא נסה שנית בעוד רגע.",
            strengths: [],
            weaknesses: [],
            vocabularyLevel: 'low'
        };
    }
};

export const explainQuestion = async (question: any, userAnswer: string): Promise<string> => {
    try {
        if (!question || !question.initialQuestion) {
            // Some questions might be simple word pairs
            // If we don't have rich context, we skip or give generic advice
        }

        if (!question.options || !Array.isArray(question.options)) {
            return "חסרים נתונים בשאלה זו (אפשרויות תשובה), לא ניתן לייצר הסבר.";
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
        Act as a professional Psychometric Exam tutor (Israeli Pshichometri).
        The student made a mistake in the following question.
        Explain WHY the correct answer is correct, and WHY the student's answer is wrong.
        Keep the explanation CONCISE (max 2-3 sentences).
        Respone in HEBREW.

        Question: ${question.question || question.word}
        Options: ${question.options.join(', ')}
        Correct Answer: ${question.correctAnswer}
        Student Answer: ${userAnswer}
        
        Category: ${question.category || 'General'}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Explain Failed:", error);

        // Detailed error analysis
        if (error.message?.includes('404')) {
            return `שגיאה (404): המודל gemini-2.5-flash-lite לא זמין. אנא בדוק שנרשמת ל-Private Preview או שהמודל שוחרר לציבור.`;
        }

        return `שגיאה ביצירת הסבר: ${error.message || 'שגיאה לא ידועה'}.`;
    }
};

export const explainTerm = async (term: any): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
        Act as a professional Psychometric Exam tutor (Israeli Pshichometri).
        The student does not know the meaning of the following term/concept.
        
        Term: "${term.word}"
        Definition: "${term.definition || term.meaning || 'מושג כללי'}"
        Category: "${term.category || 'כללי'}"
        
        Task:
        1. Explain the term simply in Hebrew.
        2. Provide a memory aid (mnemonic) or an association to help remember it (Assotsiatsia).
        3. Keep it VERY concise (max 3 sentences).
        
        Response in HEBREW only.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Term Explain Failed:", error);
        if (error.message?.includes('404')) {
            return `שגיאה (404): המודל gemini-2.5-flash-lite לא זמין.`;
        }
        return "לא הצלחתי לייצר הסבר למושג זה כרגע.";
    }
};
