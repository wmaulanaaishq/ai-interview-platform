# 🛠️ Documentation of Changes & Monozukuri Execution

This document provides a detailed log of all modifications made to the codebase during the Case Study assessment, outlining the problem statement, engineering rationale, trade-offs, and verification steps.

---

## 📌 Change Log Overview

| ID | Component / File | Severity | Type | Description |
|---|---|---|---|---|
| **FIX-01** | `web/src/pages/vacancies/VacancyListPage.tsx` | P1 | UI/UX Bug | Resolved simultaneous rendering of error banner and empty state. |
| **FIX-02** | `web/src/components/assessment/LevelRadio.tsx` | P0 | Core Interaction | Eliminated cross-row DOM radio collision using React `useId()`. |
| **FIX-03** | `web/src/pages/interview/InterviewPage.tsx` | P0 | Fault Handling | Graceful error UI for invalid links & mic rejection instead of false completion. |
| **DX-01** | `web/src/pages/auth/LoginPage.tsx` & `api.ts` | P2 | Dev Experience | Added demo mode bypass to unblock local UI exploration. |
| **DX-02** | `web/src/pages/assessments/AssessmentListPage.tsx` | P2 | Dev Experience | Added realistic fallback demo assessments when API is offline. |
| **DX-03** | `api/docker-compose.yml` & `Dockerfile.dev` | P2 | Tooling | Containerized local environment for backend services. |

---

## 🔍 Detailed Technical Breakdown

### 1. FIX-01: Vacancy List Double-State Rendering (P1)
* **File:** [`web/src/pages/vacancies/VacancyListPage.tsx`](file:///d:/PORTO/ai-interview-platform/web/src/pages/vacancies/VacancyListPage.tsx)
* **Problem:** When an API request fails, `vacancies` defaults to an empty array `[]`. The rendering logic previously evaluated `vacancies.length === 0 ? <EmptyState /> : <List />` directly beneath the `{error && <ErrorBanner />}`, causing **both** the error alert and the "No vacancies yet" box to render simultaneously.
* **Solution:** Conditioned the empty state on `!error && vacancies.length === 0`.
* **Trade-off:**
  - *Option A:* Clear vacancies state on error. (Risky: obscures previous cached data if refetching).
  - *Option B (Chosen):* Guard the JSX condition. (Clean, declarative, and zero side-effects).

---

### 2. FIX-02: LevelRadio Duplicate HTML IDs (P0)
* **File:** [`web/src/components/assessment/LevelRadio.tsx`](file:///d:/PORTO/ai-interview-platform/web/src/components/assessment/LevelRadio.tsx)
* **Problem:** Each radio item and label used hardcoded IDs (`id="level-1"`, `htmlFor="level-1"`). When multiple skills are rendered on an assessment form, clicking the label for Skill #2 or #3 triggered the first matching DOM ID (Skill #1's radio button).
* **Solution:** Introduced React 18's `useId()` hook to generate unique prefixes (`${uniqueId}-level-${level}`) per component instance.
* **Trade-off:**
  - *Option A:* Pass an explicit `name` or `skillId` prop down from the parent form. (Requires prop-drilling and breaks if skill is unsaved without an ID).
  - *Option B (Chosen):* Use React `useId()`. (Self-contained, accessible, zero extra props needed).

---

### 3. FIX-03: Graceful Error Routing for Voice Interview (P0)
* **File:** [`web/src/pages/interview/InterviewPage.tsx`](file:///d:/PORTO/ai-interview-platform/web/src/pages/interview/InterviewPage.tsx)
* **Problem:**
  1. If `sessionsApi.getCandidateInfo(token)` failed (e.g., token 404/expired), `.catch()` directly called `setInterviewState("complete")`, displaying: *"Interview Complete. Thank you. The interview has been recorded."*
  2. If a candidate blocked browser microphone permission, `startCapture()` threw an unhandled exception, causing the button to remain stuck in `"connecting"` forever.
* **Solution:**
  1. Added `errorMsg` state and differentiated 404 (invalid/expired link) vs network drops.
  2. Wrapped `startCapture()` in `try/catch` and alerted the user when hardware permission is denied.
  3. Rendered an explicit warning card (`Cannot Start Interview`) instead of misleading the candidate.
* **Trade-off:**
  - *Option A:* Redirect candidate to an external error page (`/404`). (Disorients candidate and loses layout context).
  - *Option B (Chosen):* Render an inline error boundary block within the candidate layout. (Maintains visual continuity and provides clear guidance).

---

## 🧪 Verification Steps
1. **Verify FIX-01:** Navigate to `/vacancies`. Note that only the error alert displays without the empty state box.
2. **Verify FIX-02:** Navigate to `/assessments/new`. Add 2 custom skills. Click rating labels on the second skill; observe only that row updates.
3. **Verify FIX-03:** Visit `http://localhost:5173/interview/invalid-token-test`. Observe the yellow/red alert: *"Cannot Start Interview: Invalid or expired interview link."*
