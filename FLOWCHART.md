# Bina Architecture & Logic Flow

```mermaid
graph TD
    %% Client Side Apps
    User[User (Web Client)]
    
    %% Main Screens
    subgraph Frontend [React + Vite App]
        Onboarding[Onboarding Flow]
        Home[Home Dashboard]
        Swipe[Vocabulary Swipe (SRS)]
        Write[Essay Writing]
        Review[AI Review Modal]
        
        AuthUI[Firebase Auth UI]
    end
    
    %% API & Services
    subgraph Backend [Vercel Edge & Firebase]
        FB_Auth[(Firebase Auth)]
        FB_DB[(Firestore DB)]
        
        SRS_Module[[SRS Engine / SM-2]]
        
        VercelAPI[Vercel /api/ai]
    end
    
    %% External AI
    Gemini[Google Gemini API]
    
    %% Relationships
    User -->|Visits| AuthUI
    AuthUI -->|New/Un-onboarded| Onboarding
    Onboarding -->|Saves Profile (Target, Baseline)| FB_DB
    Onboarding -->|Proceeds to| Home
    
    Home -->|Loads Stats| FB_DB
    Home -->|Starts Session (Smart)| SRS_Module
    SRS_Module -->|Fetches Due Cards| FB_DB
    SRS_Module -->|Passes Cards| Swipe
    
    Home -->|Starts Exam| Write
    
    %% Study Loops
    Swipe -->|Correct/Incorrect| SRS_Module
    SRS_Module -->|Updates Ease Factor / Next Review| FB_DB
    Swipe -->|Requests Explanation| Review
    
    Write -->|Submits Essay| VercelAPI
    
    Review -->|Checks Cache| FB_DB
    Review -->|Cache Miss| VercelAPI
    
    VercelAPI -->|Proxies Request| Gemini
    Gemini -->|Returns grading/explanation| VercelAPI
    VercelAPI -->|Saves Cache| FB_DB
    VercelAPI -->|Returns to Client| Review
```
