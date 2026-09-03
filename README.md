# ReflectAI: Private Reflective Journaling, Cognitive Radar & Resonance Tracker

[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-Deployed-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Gemini 3.6 Flash](https://img.shields.io/badge/Gemini_3.6_Flash-AI_Powered-EA4335?logo=google&logoColor=white)](https://ai.google.dev/)
[![Cloud Firestore](https://img.shields.io/badge/Cloud_Firestore-Isolated_Storage-FFA000?logo=firebase&logoColor=white)](https://firebase.google.com/docs/firestore)
[![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-Google_Sign--In-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/docs/auth)
[![React 19](https://img.shields.io/badge/React_19-TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-Dark_Mode-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Radar_&_Valence-8884d8?logo=d3.js&logoColor=white)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-grade, user-authenticated multi-turn reflective journaling and brainstorming application powered by **Gemini 3.6 Flash**, **Google Cloud Firestore**, and **Firebase Authentication**. 

Engineered with a full-stack **Node/Express + Vite/React (TypeScript)** architecture and deployed to **Google Cloud Run**, featuring deep psychological analysis including an interactive **Cognitive Bias & Blind-Spot Radar** and a **Mood & Emotional Resonance Tracker**.

---

## 🌟 Key Features

- **Private Google Authentication**: Seamless, passwordless Google Sign-In via Firebase Auth with zero credentials stored in app databases.
- **Strict Firestore Path Isolation**: Security rules enforce strict ownership (`request.auth.uid == userId`) under `/users/{userId}/entries/{entryId}`. Cross-user document reads and writes are rejected at the database engine level.
- **Multi-Turn AI Dialogue**: Converse naturally with Gemini 3.6 Flash across multi-turn inquiries. Explore emotions, untangle complex decisions, or break through creative blocks.
- **🧠 Cognitive Bias & Blind-Spot Radar**:
  - Automatically evaluates reflections across 6 key cognitive thinking patterns: *All-or-Nothing*, *Catastrophizing*, *Control Fallacy*, *Confirmation Bias*, *Emotional Reasoning*, and *Rigid Demands*.
  - Renders an interactive **Recharts Radar Chart** mapping cognitive habit intensity (0–100).
  - Pinpoints the **Dominant Cognitive Pattern** and provides a compassionate, Socratic **Blind-Spot Reframe** to cultivate psychological flexibility.
- **🌊 Mood & Emotional Resonance Tracking**:
  - Classifies the user's primary emotional tone (e.g., *Reflective & Grounded*, *Overwhelmed & Seeking Clarity*, *Cautious Optimism*).
  - Gauges overall emotional valence (0–100% emotional clarity vs. friction) and energy level (*Low*, *Moderate*, *Elevated*, *High*).
  - Tracks 4 core spectrum metrics: **Clarity**, **Calm**, **Optimism**, and **Agency**.
  - Provides psychologist-grounded **Resonance Guidance** notes to redirect emotional tension into productive forward momentum.
- **Automatic Synthesis & Real-Time Insights**:
  - **Core Summary**: Distills raw reflections into succinct, actionable overviews.
  - **Key Realizations**: Highlights core cognitive takeaways and perspective reframes.
  - **Deepening Questions**: Generates thoughtful Socratic follow-up prompts to push your thinking further.
- **Resilient AI Fallback Ladder**: Robust error recovery protocol that prevents outages:
  1. `gemini-3.6-flash` (Primary high-speed conversational model)
  2. `gemini-3.1-flash-lite` (High-availability fallback on quota exhaustion/503)
  3. `gemini-flash-latest` (Dynamic alias route)
  4. `gemini-3.7-flash` (Deep analytical reasoning tier)
- **Zero-Crash Payload Hygiene**: Automatic undefined-stripping sanitizer ensuring that no malformed payloads cause database driver exceptions.
- **Sophisticated Dark UI**: Crafted with an eye-safe dark theme (`#0A0A0B` / `#121214`), Plus Jakarta Sans typography, and warm amber and emerald accents.
- **In-App Security Inspector**: Embedded security modal presenting the full 5-zone agentic threat model and active Firestore security rules.

---

## 🛡️ Agentic Threat Model & Security Architecture

ReflectAI was built from the ground up according to strict **OWASP Top 10 (Web)** and **OWASP Top 10 for LLM Applications** guidelines:

| Threat Zone | Threat Scenario | OWASP Mapping | Countermeasure Implemented |
| :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Malicious payloads, prototype pollution, oversized text | OWASP A03 / LLM02 | Top-level Express JSON body-parser with a 5MB payload ceiling; runtime type assertions; null-safe parameter destructuring. |
| **2. Planning & Reasoning** | Prompt injection, instruction bypass, role escaping | OWASP LLM01 | Deterministic system prompts isolating user reflections as plain text data; strictly structured JSON schema output enforcement. |
| **3. Tool Execution** | Dynamic code execution, SSRF, unauthorized backend tampering | OWASP LLM07 / A01 | Zero client-side `eval()` or unvetted URL fetching; server-side Google GenAI SDK proxy only. |
| **4. Memory & State** | Cross-user data leaks, unauthorized reads/writes, undefined payload crashes | OWASP A01 / A05 | Document-level Firestore rules locking access to `request.auth.uid == userId`; deep sanitizer stripping `undefined` fields. |
| **5. Inter-System Comm.** | Exposure of `GEMINI_API_KEY` in frontend bundles | OWASP A02 / LLM06 | API keys reside strictly on the server (`process.env.GEMINI_API_KEY`); Google Cloud Secret Manager integration in Cloud Run. |

---

## 📋 Comprehensive Functional Test Walkthrough

Use this step-by-step test script to verify all core functional flows and edge cases:

### Test Suite 1: Authentication & User Isolation
- [ ] **TC-1.1: Unauthenticated Landing State**: Visit the app while logged out. Verify that the welcome card displays with "Sign in with Google", the feature breakdown, and the "Review Threat Model & Architecture" button.
- [ ] **TC-1.2: Google Sign-In Execution**: Click "Sign in with Google". Complete the Google OAuth popup. Verify that your profile avatar, display name, and email appear in the top navbar.
- [ ] **TC-1.3: User Isolation Verification**: Sign in with User A and create an entry. Sign out, then sign in with User B. Verify that User A's entries are not visible and cannot be retrieved from Firestore.
- [ ] **TC-1.4: Sign Out**: Click the sign out icon in the navigation bar. Confirm immediate redirection to the unauthenticated landing screen and clearing of active session state.

### Test Suite 2: Journal Creation & Multi-Turn AI Reflections
- [ ] **TC-2.1: Default Starter Screen**: Upon opening a new entry, verify the empty state presents suggested starter prompts tailored to the selected category (e.g., "Personal Reflection", "Decision Making", "Brainstorming").
- [ ] **TC-2.2: Starter Prompt Injection**: Click any starter prompt card. Verify the text is copied into the reflection input area ready for editing.
- [ ] **TC-2.3: Reflection Submission**: Type your reflection (or press Enter). Verify that:
  - The user thought appears in a high-contrast white card on the right.
  - The loading indicator pulses: *"Gemini 3.6 Flash is synthesizing your thoughts..."*
  - The input textarea is temporarily disabled to prevent race conditions.
- [ ] **TC-2.4: Multi-Turn Continuity**: Type a follow-up inquiry (e.g., *"How can I break this down into 3 steps?"*). Verify that Gemini's response retains context from the previous turn.
- [ ] **TC-2.5: Shift+Enter vs Enter**: Verify that pressing `Shift+Enter` inserts a new line in the text area, while `Enter` sends the reflection.

### Test Suite 3: Automatic Synthesis & Insights Panel
- [ ] **TC-3.1: Real-Time Summary Generation**: After submitting a reflection, inspect the "AI Synthesis & Insights" panel on the right. Verify that the **Core Summary** updates with an accurate distillation.
- [ ] **TC-3.2: Key Insights Extraction**: Verify that 2–4 bulleted realizations appear under **Key Insights & Realizations**.
- [ ] **TC-3.3: Interactive Follow-up Prompts**: Verify that **Suggested Deepening Questions** appear. Click one of these suggestions; confirm it immediately populates the input textarea for your next turn.

### Test Suite 4: Cognitive Bias & Blind-Spot Radar
- [ ] **TC-4.1: Radar Tab Switch**: In the right-hand panel, click the **Radar** tab. Verify the interactive Recharts Radar Chart renders cleanly.
- [ ] **TC-4.2: Dimension Mapping**: Confirm that the 6 cognitive dimensions (*All-or-Nothing*, *Catastrophizing*, *Control Fallacy*, *Confirmation Bias*, *Emotional Reasoning*, *Rigid Demands*) show scores between 0 and 100.
- [ ] **TC-4.3: Tooltip Interactivity**: Hover over points on the radar chart; verify the tooltip pops up showing the dimension name, intensity score, and description.
- [ ] **TC-4.4: Dominant Habit Badge & Socratic Reframe**: Confirm that the "Primary: [Pattern]" badge displays at the top and the "Blind-Spot Reframe" box offers a constructive, compassionate reframe.
- [ ] **TC-4.5: Dimension Breakdown**: Check the dimension breakdown cards below the chart; verify that color-coded progress bars reflect low (<35%), moderate (35-60%), and high (>60%) intensities.

### Test Suite 5: Mood & Emotional Resonance Tracking
- [ ] **TC-5.1: Mood Tab Switch**: Click the **Mood** tab in the right-hand panel. Verify the emotional resonance dashboard appears with a subtle indicator badge.
- [ ] **TC-5.2: Primary Tone & Energy Level**: Confirm that the detected tone (e.g., *"Reflective & Grounded"*) and energy level badge (*Low*, *Moderate*, *Elevated*, *High*) match the tone of the reflection.
- [ ] **TC-5.3: Valence Meter**: Check the Valence Score (0–100%) and verify that the gradient progress bar (*Emotional Friction* &rarr; *Clarity & Ease*) animates smoothly.
- [ ] **TC-5.4: 4-Spectrum Trait Progress**: Inspect the individual trait progress bars for **Clarity**, **Calm**, **Optimism**, and **Agency**.
- [ ] **TC-5.5: Resonance Guidance**: Read the Resonance Guidance card; confirm it provides psychologist-backed encouragement for channelizing the current state into positive forward momentum.

### Test Suite 6: Persistence, Organization & Search
- [ ] **TC-6.1: Live Firestore Persistence**: Observe the save status badge in the editor header. Verify it transitions from *"Syncing Firestore..."* to *"Persisted"* with a green checkmark, saving turns, radar data, and emotional metrics.
- [ ] **TC-6.2: History Emotional Tagging**: Look at the entry cards in the left history sidebar; confirm that the primary emotional tone tag appears next to the category and date.
- [ ] **TC-6.3: Category Filtering**: Change the entry category via the dropdown. Select different category filter pills in the history sidebar ("Personal", "Decisions", "Brainstorming") and confirm that list items filter accurately.
- [ ] **TC-6.4: Real-time Keyword Search**: Type a keyword into the search bar. Verify the entry list dynamically filters to matches in either titles, summary content, or dialogue.
- [ ] **TC-6.5: Entry Deletion**: Hover over an entry in the history list, click the trash can icon, and confirm the browser confirmation dialog. Verify the entry is permanently removed from Firestore and the UI.

### Test Suite 7: Security Architecture & Modal
- [ ] **TC-7.1: Threat Model Inspection**: Click "Security Architecture" in the top navigation bar. Verify the modal opens displaying the 5-zone Threat Summary Table, the exact Firestore security rules, the Gemini fallback ladder, and Secret Manager hygiene checklist.
- [ ] **TC-7.2: Modal Dismissal**: Press the Escape key, click the close button, or click the backdrop to dismiss the modal cleanly.

---

## 🚀 Cloud Run Deployment & Campaign Verification

### 1. Prerequisites
- [Google Cloud SDK (`gcloud` CLI)](https://cloud.google.com/sdk/docs/install)
- [Firebase CLI (`firebase-tools`)](https://firebase.google.com/docs/cli)
- Node.js 20+ and npm

### 2. Enable Required GCP APIs
```bash
# Set your active Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# Enable Cloud Run, Secret Manager, Cloud Build, and Cloud Firestore APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 3. Secret Manager Setup
```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Deploy Firestore Security Rules
Ensure `firestore.rules` contains the user-isolated security policy:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy the rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy to Google Cloud Run
```bash
# Deploy container service directly from source with Secret Manager binding
gcloud run deploy reflect-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

### 6. Required Campaign Labeling (Verification Binding)
To register the service for automated challenge verification:
```bash
gcloud run services update reflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/reflect-ai.git
   cd reflect-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   PORT=3000
   ```

4. **Start the local server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📦 Publishing to GitHub

Follow these quick commands to initialize and push this project to your GitHub account:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Commit changes
git commit -m "feat: implement Cognitive Radar and Emotional Resonance Tracking in ReflectAI"

# 4. Create a new repository on GitHub (e.g. 'reflect-ai') and link it
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reflect-ai.git

# 5. Push to GitHub
git push -u origin main
```

---

## 💡 Unique Features You Can Add Next

Here are exciting ideas for expanding ReflectAI even further:

1. **Voice-to-Reflection (Audio Journaling)**:
   - Integrate the Web Speech API or Gemini Multimodal Live API to allow users to dictate raw thoughts hands-free while walking or unwinding.
   - Automatically transcribe, punctuate, and extract key action items.

2. **Decision Matrix Simulator (Branching Thoughts)**:
   - For decision entries, provide an interactive "Decision Tree" view where users can explore "Option A vs. Option B".
   - Gemini simulates second-order consequences, best-case/worst-case scenarios, and probability assessments.

3. **Weekly Reflection & Growth Digest**:
   - An automated Sunday evening synthesis where Gemini reads through the week's journal entries and generates a unified "Week in Review": recurring themes, breakthroughs achieved, and suggested focus questions for the upcoming week.

4. **Encrypted Vault Export**:
   - One-click export to Markdown or PDF, with optional client-side AES-256 password encryption before downloading backup archives.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
