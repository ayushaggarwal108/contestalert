# ContestAlert

ContestAlert is an AI-powered contest management system designed to help competitive programmers stay ahead of the game. It aggregates upcoming contests from platforms like Codeforces, LeetCode, and CodeChef, and leverages Google Gemini AI to provide a natural language interface for querying contests and scheduling reminders directly to your Google Calendar.

## 🚀 Features

- **AI-Powered Chat**: Use natural language to ask about upcoming contests or schedule reminders (e.g., "Remind me about the next LeetCode weekly contest").
- **Multi-Platform Aggregation**: Automatically fetches data from Codeforces, LeetCode, and CodeChef.
- **Google Calendar Integration**: One-click sync to add contest schedules to your personal Google Calendar with automatic reminders.
- **Secure Authentication**: Implements Google OAuth 2.0 for seamless and secure user login.
- **Premium UI/UX**: A modern, dark-themed dashboard built with glassmorphism aesthetics and responsive design.
- **Intelligent Background Sync**: Automated cron jobs keep the contest database fresh and up-to-date.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Vanilla CSS (Custom Design System), Axios, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **AI**: Google Gemini API (using the `@google/genai` SDK).
- **Authentication**: Passport.js with Google OAuth 2.0 Strategy.
- **External APIs**: Google Calendar API, Codeforces API, LeetCode GraphQL, CodeChef API.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Project (with Calendar API enabled)
- Google AI Studio API Key (for Gemini)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/contest-alert.git
   cd contest-alert
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   SESSION_SECRET=your_random_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## 📖 Usage

1. **Login**: Sign in with your Google account.
2. **Browse**: View all upcoming contests on the dashboard.
3. **Connect Calendar**: Click "Connect Now" to grant calendar permissions for automated scheduling.
4. **Chat**: Ask the Gemini Assistant about contests or tell it to set a reminder for a specific event.


