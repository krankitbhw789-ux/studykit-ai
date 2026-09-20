# PDF Study Kit & Intelligent Notes Generator

An AI-powered application that transforms study PDFs into structured notes, executive summaries, important question analyzers, interactive mind maps, MCQ practice tests, correction trackers, and a comprehensive study progress dashboard.

## Features

- **Notes Generator**: Structured study notes with high-yield axioms and comprehensive breakdowns.
- **PDF Summary**: Executive summary, core concepts, and key takeaways in seconds.
- **Important Question Analyser**: Ranked high-yield exam topics and key question frequency breakdown.
- **Mind Map**: Interactive concept hierarchy, semantic trees, and visual knowledge graphs.
- **MCQ Generator**: Interactive practice test questions with instant feedback and explanations.
- **Correction Tracker**: Track mistakes, analyze weak spots, and practice targeted remediation.
- **Study Progress Dashboard**: Tracks time spent studying (with Page Visibility pause), reading progress percentages per section, viewed tools, and test scores.

---

## Getting Started Locally

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation & Development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```
   Set `GEMINI_API_KEY` in your `.env` file.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Building for Production

To build the application for production deployment:

```bash
npm run build
```

The compiled output will be placed in the `dist/` directory.

---

## Deployment (GitHub & Netlify)

1. **Push to GitHub**:
   - Create a new repository on GitHub.
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <your-github-repo-url>
     git push -u origin main
     ```

2. **Deploy on Netlify**:
   - Log in to [Netlify](https://www.netlify.com).
   - Click **Add new site** > **Import an existing project**.
   - Connect to your GitHub repository and select your branch (`main`).
   - Netlify will automatically detect `netlify.toml` and configure the build settings (`npm run build`, publish directory `dist`).
   - Go to **Site settings** > **Environment variables** and add:
     - `GEMINI_API_KEY`: Your Google Gemini API key.
   - Click **Deploy site**.
