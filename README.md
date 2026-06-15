# AegisCore | Advanced Cybersecurity Defense

[![CI](https://github.com/Fahimfylo/Aegies-core/actions/workflows/ci.yml/badge.svg)](https://github.com/Fahimfylo/Aegies-core/actions/workflows/ci.yml)
[![CD](https://github.com/Fahimfylo/Aegies-core/actions/workflows/cd.yml/badge.svg)](https://github.com/Fahimfylo/Aegies-core/actions/workflows/cd.yml)
[![Security Audit](https://github.com/Fahimfylo/Aegies-core/actions/workflows/security-audit.yml/badge.svg)](https://github.com/Fahimfylo/Aegies-core/actions/workflows/security-audit.yml)
[![PR Quality](https://github.com/Fahimfylo/Aegies-core/actions/workflows/pr-quality.yml/badge.svg)](https://github.com/Fahimfylo/Aegies-core/actions/workflows/pr-quality.yml)

A high-fidelity cybersecurity defensive platform prototype with real-time threat detection, AI-powered analysis, and a Chrome extension for browser protection.

## Features

- **File Scanner**: Heuristic and AI-powered binary analysis with MITRE ATT&CK mapping
- **URL Scanner**: Phishing detection and domain reputation checks
- **Email Phishing Analyzer**: Multi-layer detection (SPF/DKIM/DMARC, keywords, typosquatting, AI)
- **Website Security Scanner**: SSL validation, security headers audit, vulnerability detection
- **Threat Intel**: Dynamic daily security briefings powered by GenAI
- **Dashboard**: Real-time security telemetry and timelines
- **Chrome Extension**: Real-time URL checking with security warning overlays
- **Security Score Engine**: 5-category weighted scoring with A-F grading
- **Security Awareness Training**: Phishing simulations and security quizzes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **AI Engine**: Genkit + Google Gemini 2.5 Flash
- **Database**: MongoDB (Mongoose)
- **Auth**: bcryptjs + JWT (jose)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Extension**: Chrome Manifest V3

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET, and GEMINI_API_KEY

# Start development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Chrome Extension

The extension is in `extension/` directory. Load it in Chrome:

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click Load Unpacked
4. Select the `extension/` folder

Alternatively, download from:
- **Web**: Visit `/install-extension` on the running app
- **CLI**: Run `npm run build:extension` to generate `public/extensions/extension-v*.zip`

## CI/CD Pipeline

## CLI Tool

```bash
node cli/index.js scan <file>
node cli/index.js scan-url <url>
node cli/index.js ioc <type> <value>
node cli/index.js breach <email>
```
