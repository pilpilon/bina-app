# Application Audit Document

## Overview
This document outlines the architecture, toolchain, and AI prompt configuration of the **Bina / Psichometri** application. It serves as a technical reference guide for external auditing, future AI-assisted development, and general system improvement.

---

## 1. System Architecture
The application is a modern Single Page Application (SPA) providing AI-powered tutoring and grading for the Israeli Psychometric Entrance Exam.

### 1.1 Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling & UI:** Tailwind CSS, PostCSS, Framer Motion (for fluid animations), Lucide React (vector icons)
- **Routing:** React Router v6
- **Build Tool:** Vite (for rapid HMR and optimized production bundling)

### 1.2 Backend & Data Storage
- **Primary Backend (BaaS):** Firebase
  - **Authentication:** Firebase Auth (Email/Password, Google OAuth).
  - **Database:** Cloud Firestore (NoSQL document database) for user profiles, progress tracking, and settings.
- **Serverless API:** Vercel Functions (`@vercel/node`)
  - Contains endpoints such as payment webhooks (`api/paddle-webhook.ts`).

### 1.3 Monetization
- **Payment Gateways:** Integrations exist for both **Stripe** (`@stripe/stripe-js`) and **Paddle** (serverless webhook).

---

## 2. AI Integration & Prompt Configuration
The core value proposition relies on generative AI to assess user input and explain complex concepts.

### 2.1 Toolchain
- **Provider:** Google Generative AI
- **SDK:** `@google/generative-ai` (^0.24.1)
- **Model:** `gemini-2.5-flash-lite`
  - *Reasoning:* Chosen for its low latency, high throughput, and cost-effectiveness, which is critical for real-time tutoring and feedback loops.

### 2.2 Core AI Use Cases (from \`src/services/aiScoring.ts\`)

**A. Essay Grading (\`analyzeWriting\`)**
- **System Persona:** Professional grader for the Israeli Psychometric Entrance Exam.
- **Task:** Analyzes argumentative essays written in Hebrew.
- **Evaluation Criteria:** Content (50%) and Language (50%).
- **Structured Output:** Forces a native JSON schema response containing:
  - Normalized Score (0-100)
  - Concise feedback (Max 3 sentences in Hebrew)
  - Strengths/Weaknesses (Arrays of points)
  - Vocabulary Level (low/medium/high)

**B. Question Explanation (\`explainQuestion\`)**
- **System Persona:** Professional Psychometric Exam tutor.
- **Task:** Identifies why the selected answer is wrong and explains why the correct answer is right.
- **Constraints:** Extremely concise explanations (2-3 sentences), entirely in Hebrew.

**C. Vocabulary/Concept Tutoring (\`explainTerm\`)**
- **System Persona:** Professional Psychometric Exam tutor.
- **Task:** Explains specific terms and provides a memory aid (mnemonic/assotsiatsia) to help the student remember it natively.
- **Constraints:** Concise (Max 3 sentences), entirely in Hebrew.

### 2.3 Potential AI Improvements / Technical Debt
- **Security Vulnerability:** Currently, the generative AI API key is instantiated directly on the client side (`const genAI = new GoogleGenerativeAI('AIzaSyBOseTkLoEDaO_rnMq1cnSraEDrjGwVuTc');`). 
  - *Mitigation:* This should be migrated to a proxy server (e.g., Vercel Serverless Function) before public MVP release to prevent unauthorized extraction and billing abuse.
- **Model Upgrades:** Given the recent iterations of the Gemini model families, testing prompt accuracy with `gemini-2.5-flash` or `gemini-2.5-pro` (for complex essay grading specifically) could yield more nuanced feedback at a higher cost.

---

## 3. General Development Constraints
- **Hebrew First UX:** The core interface relies on robust RTL (`dir="rtl"`) text rendering.
- **Mobile-First / Touch-Friendly:** Critical application of glassmorphism variants (`bg-white/5` and `backdrop-blur-xl`), distinct drop-shadows, and touch-target sizes to avoid "AI Slop" designs.
