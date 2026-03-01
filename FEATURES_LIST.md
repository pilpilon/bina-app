# Bina (Psichometri) Features List

## Phase 1: AI-Driven Design
- [x] Initial React/Vite scaffolding
- [x] Tailwind CSS + Glassmorphism design system (Dark Mode, Hebrew RTL)
- [x] Framer Motion animations across components

## Phase 2: Core Tech & UX
- [x] **Firebase Auth**: User signup, login, and session persistence.
- [x] **Firestore Database**: 
    - Real-time user stats syncing (streaks, xp, level).
    - Semantic Caching for AI responses to reduce costs.
- [x] **Vercel Serverless Platform**: Secure API proxy for Gemini to protect API keys.
- [x] **Study Mechanics**:
    - Swipe Cards (Tinder-like UI for vocabulary).
    - Writing Screen (Timed essay simulator with word/line counts).
- [x] **AI Core Features**:
    - `analyzeWriting`: Grades essays using `gemini-2.5-flash`.
    - `explainQuestion`: Explains multiple choice errors using `gemini-2.5-flash-lite`.
    - `explainTerm`: Explains vocabulary using `gemini-2.5-flash-lite`.
- [x] **UX Improvements**:
    - BiDi (Bidirectional) text rendering support for AI output.
    - Multi-step dynamic loading screen for AI essay grading latency.

## Phase 3: Content & Intelligence
- [x] **Path to Value (Onboarding)**:
    - Target score, baseline score, and exam date selection.
    - Synchronized saving directly to user profile.
- [x] **Spaced Repetition System (SRS)**:
    - Implemented SM-2 scheduling logic (`src/services/srs.ts`).
    - Smart Practice mode prioritizes due review cards automatically.
    - Swiping updates SRS metrics in real-time.

## Next Steps
- Calculate and display personalized daily XP targets based on onboarding data.
- Display "Items Due Today" count on UI buttons.
