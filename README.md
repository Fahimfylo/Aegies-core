# AegisCore | Advanced Cybersecurity Defense

This is a high-fidelity cybersecurity defensive platform prototype built with Next.js, Tailwind CSS, and Genkit.

## Local Development Setup

To run this project on your local machine:

1. **Clone/Copy**: Replicate the file structure and copy the contents of each file from the editor.
2. **Environment Variables**: Create a `.env` file in the root and add your `GOOGLE_GENAI_API_KEY`.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Features
- **File Scanner**: Heuristic and AI-powered binary analysis.
- **URL Scanner**: Phishing detection and domain reputation checks.
- **Threat Intel**: Dynamic daily security briefings powered by GenAI.
- **Dashboard**: Real-time security telemetry and timelines.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **AI Engine**: Genkit + Google Gemini 2.5 Flash
- **Icons**: Lucide React
- **Charts**: Recharts
