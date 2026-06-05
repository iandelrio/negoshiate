"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import {
  ArrowLeft,
  Bot,
  CircleStop,
  Loader2,
  Mic,
  Play,
  Radio,
  RotateCcw,
  Send,
} from "lucide-react";
import { splitContextAnswers } from "@/lib/questions";
import type {
  ContextAnswers,
  FeedbackResponse,
  Scenario,
  TranscriptEntry,
} from "@/lib/types";

const MAX_SECONDS = 5 * 60;
const MAX_USER_TURNS = 12;
const WARNING_SECONDS = 4 * 60;
const WARNING_USER_TURNS = 10;

export function VoiceSimulation(props: {
  scenario: Scenario;
  answers: ContextAnswers;
  onBack: () => void;
  onFeedback: (feedback: FeedbackResponse, transcript: TranscriptEntry[]) => void;
}) {
  return <VoiceSimulationInner {...props} />;
}

function VoiceSimulationInner({
  scenario,
  answers,
  onBack,
  onFeedback,
}: {
  scenario: Scenario;
  answers: ContextAnswers;
  onBack: () => void;
  onFeedback: (feedback: FeedbackResponse, transcript: TranscriptEntry[]) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [manualText, setManualText] = useState("");
  const [sampleMode, setSampleMode] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const conversation = useConversation({
    onMessage: (message: unknown) => {
      const entry = normalizeConversationMessage(message);
      if (!entry) return;
      setTranscript((current) => {
        const last = current[current.length - 1];
        if (last?.role === entry.role && last.text === entry.text) return current;
        return [...current, entry];
      });
    },
    onError: (nextError: unknown) => {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "The voice session encountered an error.",
      );
    },
  });

  const userTurns = transcript.filter((entry) => entry.role === "user").length;
  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting" || isStarting;
  const nearLimit = elapsed >= WARNING_SECONDS || userTurns >= WARNING_USER_TURNS;
  const progress = Math.min(100, (elapsed / MAX_SECONDS) * 100);
  const remaining = Math.max(0, MAX_SECONDS - elapsed);

  const sessionContext = useMemo(() => {
    const grouped = splitContextAnswers(scenario.id, answers);
    return {
      scenario_id: scenario.id,
      user_context_json: JSON.stringify(grouped.user_fact),
      agent_parameters_json: JSON.stringify(grouped.agent_parameter),
      max_duration_minutes: "5",
      max_user_turns: "12",
    };
  }, [answers, scenario.id]);

  const endSession = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    setIsGeneratingFeedback(true);

    try {
      if (conversation.status === "connected") {
        await conversation.endSession();
      }
      const finalTranscript = transcript.length
        ? transcript
        : buildSampleTranscript(scenario.title, answers);
      const feedback = await requestFeedback(scenario.id, answers, finalTranscript);
      onFeedback(feedback, finalTranscript);
    } catch (nextError) {
      endedRef.current = false;
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Feedback generation failed.",
      );
      setIsGeneratingFeedback(false);
    }
  }, [answers, conversation, onFeedback, scenario.id, scenario.title, transcript]);

  useEffect(() => {
    if (!isConnected && !sampleMode) return;
    const interval = window.setInterval(() => {
      const startedAt = startedAtRef.current ?? Date.now();
      startedAtRef.current = startedAt;
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isConnected, sampleMode]);

  useEffect(() => {
    if (!isConnected && !sampleMode) return;
    if (elapsed >= MAX_SECONDS || userTurns >= MAX_USER_TURNS) {
      void endSession();
    }
  }, [elapsed, endSession, isConnected, sampleMode, userTurns]);

  async function startVoiceSession() {
    setError(null);
    setIsStarting(true);
    endedRef.current = false;

    try {
      const scenarioResponse = await fetch(`/api/scenarios/${scenario.id}`);
      if (!scenarioResponse.ok) throw new Error("Failed to load scenario guide.");
      const { markdown } = (await scenarioResponse.json()) as { markdown: string };

      const signedUrlResponse = await fetch("/api/elevenlabs-signed-url");
      if (!signedUrlResponse.ok) {
        const body = (await signedUrlResponse.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "ElevenLabs is not configured.");
      }
      const { signedUrl } = (await signedUrlResponse.json()) as { signedUrl: string };

      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        dynamicVariables: {
          ...sessionContext,
          scenario_markdown: markdown,
        },
      });
      startedAtRef.current = Date.now();
      setElapsed(0);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to start the voice session.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  function startSampleSession() {
    setError(null);
    setSampleMode(true);
    endedRef.current = false;
    startedAtRef.current = Date.now();
    setElapsed(0);
    setTranscript(buildSampleTranscript(scenario.title, answers));
  }

  async function sendManualMessage() {
    const nextText = manualText.trim();
    if (!nextText) return;
    setManualText("");
    setTranscript((current) => [...current, { role: "user", text: nextText }]);
    if (conversation.status === "connected") {
      conversation.sendUserMessage(nextText);
    }
  }

  return (
    <section className="session-layout">
      <div className="panel session-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Live simulation</p>
            <h2>{scenario.title}</h2>
          </div>
          <span className={`status-pill ${isConnected || sampleMode ? "live" : ""}`}>
            <Radio aria-hidden="true" size={14} />
            {isConnected ? "Live" : sampleMode ? "Sample" : conversation.status}
          </span>
        </div>

        <div className="session-meter">
          <div>
            <span>{formatTime(remaining)}</span>
            <p>Time remaining</p>
          </div>
          <div>
            <span>{userTurns}/{MAX_USER_TURNS}</span>
            <p>User turns</p>
          </div>
          <div>
            <span>{nearLimit ? "Wrap up" : "Practice"}</span>
            <p>Session state</p>
          </div>
        </div>

        <div className="progress-track" aria-label="Session progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="voice-stage">
          <div className={`voice-orb ${conversation.isSpeaking ? "speaking" : ""}`}>
            <Bot aria-hidden="true" size={34} />
          </div>
          <div>
            <h3>
              {conversation.isSpeaking
                ? "Agent is speaking"
                : isConnected
                  ? "Agent is listening"
                  : "Ready when you are"}
            </h3>
            <p>
              The session ends at five minutes or twelve user turns. Feedback is
              generated after the session closes.
            </p>
          </div>
        </div>

        {nearLimit ? (
          <div className="notice">
            The session is near the limit. Move toward a concise final ask,
            summary, or next step.
          </div>
        ) : null}

        {error ? <div className="error-box">{error}</div> : null}

        <div className="button-row">
          <button
            className="secondary-button"
            disabled={isConnected || isGeneratingFeedback}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Back
          </button>
          {!isConnected && !sampleMode ? (
            <>
              <button
                className="secondary-button"
                disabled={isConnecting || isGeneratingFeedback}
                onClick={startSampleSession}
                type="button"
              >
                <Play aria-hidden="true" size={17} />
                Sample
              </button>
              <button
                className="primary-button"
                disabled={isConnecting || isGeneratingFeedback}
                onClick={startVoiceSession}
                type="button"
              >
                {isConnecting ? (
                  <Loader2 aria-hidden="true" className="spin" size={17} />
                ) : (
                  <Mic aria-hidden="true" size={17} />
                )}
                Start voice
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              disabled={isGeneratingFeedback}
              onClick={endSession}
              type="button"
            >
              {isGeneratingFeedback ? (
                <Loader2 aria-hidden="true" className="spin" size={17} />
              ) : (
                <CircleStop aria-hidden="true" size={17} />
              )}
              End and score
            </button>
          )}
        </div>
      </div>

      <aside className="panel live-transcript-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Transcript</p>
            <h2>{transcript.length ? `${transcript.length} turns` : "No turns yet"}</h2>
          </div>
          <button
            aria-label="Reset transcript"
            className="icon-button"
            disabled={isConnected || isGeneratingFeedback}
            onClick={() => setTranscript([])}
            title="Reset transcript"
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
          </button>
        </div>

        <div className="transcript-list compact-list">
          {transcript.length ? (
            transcript.map((entry, index) => (
              <div className={`transcript-entry ${entry.role}`} key={`${entry.role}-${index}`}>
                <span>{entry.role === "agent" ? "Agent" : "You"}</span>
                <p>{entry.text}</p>
              </div>
            ))
          ) : (
            <p className="muted">Start a voice session to capture the conversation.</p>
          )}
        </div>

        <div className="manual-message">
          <input
            disabled={!isConnected && !sampleMode}
            onChange={(event) => setManualText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void sendManualMessage();
            }}
            placeholder="Optional typed user turn"
            type="text"
            value={manualText}
          />
          <button
            aria-label="Send typed user turn"
            className="icon-button dark"
            disabled={(!isConnected && !sampleMode) || !manualText.trim()}
            onClick={() => void sendManualMessage()}
            title="Send typed user turn"
            type="button"
          >
            <Send aria-hidden="true" size={16} />
          </button>
        </div>
      </aside>
    </section>
  );
}

async function requestFeedback(
  scenarioId: string,
  contextAnswers: ContextAnswers,
  transcript: TranscriptEntry[],
) {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId, contextAnswers, transcript }),
  });

  if (!response.ok) {
    throw new Error("Feedback generation failed.");
  }

  return (await response.json()) as FeedbackResponse;
}

function normalizeConversationMessage(message: unknown): TranscriptEntry | null {
  if (!message || typeof message !== "object") return null;
  const record = message as Record<string, unknown>;
  const text =
    typeof record.message === "string"
      ? record.message
      : typeof record.text === "string"
        ? record.text
        : "";
  const source = String(record.source ?? record.role ?? "").toLowerCase();
  if (!text.trim()) return null;
  if (source.includes("user")) return { role: "user", text };
  if (source.includes("agent") || source.includes("ai")) return { role: "agent", text };
  return null;
}

function buildSampleTranscript(
  scenarioTitle: string,
  answers: ContextAnswers,
): TranscriptEntry[] {
  const context = Object.values(answers).filter(Boolean).slice(0, 3).join(", ");
  return [
    {
      role: "agent",
      text: `Let's practice ${scenarioTitle}. Give me the short version of what you want to accomplish today.`,
    },
    {
      role: "user",
      text: context
        ? `I want to handle this clearly. The key context is ${context}.`
        : "I want to make a clear case and stay composed when challenged.",
    },
    {
      role: "agent",
      text: "That makes sense, but I need you to be more specific. What exactly are you asking for, and why now?",
    },
    {
      role: "user",
      text: "My ask is specific, and I can tie it to recent impact. I also want to understand what concerns would make this hard to approve.",
    },
  ];
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
