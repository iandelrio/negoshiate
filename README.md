# Negoshiate

Negoshiate is a Next.js app for rehearsing high-stakes conversations with an AI voice counterparty. Users choose a scenario, answer a short setup questionnaire, run a timed voice simulation, then receive a transcript-based feedback report.

The current scenarios are:

- Salary negotiation
- Networking introduction
- Behavioral interview with STAR

The app uses ElevenLabs Agents for live voice sessions and Vertex AI Gemini for structured feedback when Google Cloud is configured. It also includes a Sample mode and fallback feedback so the core flow can run locally without paid API calls.

## Requirements

- Node.js 18.18 or newer
- npm
- Optional: an ElevenLabs account and private Agent for live voice sessions
- Optional: a Google Cloud project with Vertex AI access for AI-generated feedback

## Local Setup

Install dependencies:

```sh
npm install
```

Create a local environment file:

```sh
cp .env.example .env.local
```

For the minimal local demo, you can leave the environment values blank and use Sample mode in the app. For live voice and AI feedback, fill in the values described below.

Start the development server:

```sh
npm run dev
```

Open the app at:

```txt
http://localhost:3000
```

## Environment Variables

```txt
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=
FEEDBACK_MODEL=gemini-1.5-pro
```

`ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` are required only for live voice sessions. Without them, use Sample mode.

`GOOGLE_CLOUD_PROJECT` is required for Vertex AI feedback. If it is missing or feedback generation fails, the app returns a local fallback report.

`GOOGLE_APPLICATION_CREDENTIALS` is optional when your local environment is already authenticated through Google Application Default Credentials or when the app runs in Google Cloud with an attached service account.

## ElevenLabs Agent Setup

Create one private ElevenLabs Agent and set `ELEVENLABS_AGENT_ID` to that agent's ID. The app requests a signed URL from `/api/elevenlabs-signed-url` and passes scenario context through dynamic variables.

Configure the Agent dynamic variables listed in [docs/elevenlabs-agent-setup.md](docs/elevenlabs-agent-setup.md), then copy the prompt from that file into the ElevenLabs Agent prompt.

Recommended cost-control settings:

- Dashboard max conversation duration: `150` seconds
- Networking introduction cap in app: `90` seconds, `4` user turns
- Behavioral interview cap in app: `120` seconds, `5` user turns
- Salary negotiation cap in app: `150` seconds, `6` user turns
- Use Sample mode for UI testing and reserve live voice for final checks

## Available Scripts

```sh
npm run dev
```

Runs the Next.js development server.

```sh
npm run typecheck
```

Runs TypeScript without emitting build output.

```sh
npm run lint
```

Runs the Next.js lint command.

```sh
npm run build
```

Creates a production build.

## Project Structure

```txt
app/                         Next.js app routes and API routes
components/                  UI components for the scenario flow
lib/                         Scenario, question, download, and type helpers
scenarios/                   Markdown guides injected into the voice agent
docs/                        Product and ElevenLabs setup notes
```

## Local Usage Notes

1. Select a scenario.
2. Answer the setup questions.
3. Choose Sample for a no-cost local run, or Start voice for an ElevenLabs session.
4. End the session or wait for the scenario cap.
5. Review the transcript and feedback report.

Live voice sessions consume ElevenLabs credits. The app is intentionally capped by scenario to keep demos predictable and reduce credit burn.
