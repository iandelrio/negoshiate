"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ContextQuestionnaire } from "@/components/ContextQuestionnaire";
import { FeedbackReport } from "@/components/FeedbackReport";
import { ScenarioPicker } from "@/components/ScenarioPicker";
import { VoiceSimulation } from "@/components/VoiceSimulation";
import { scenarios } from "@/lib/scenarios";
import type {
  ContextAnswers,
  FeedbackResponse,
  ScenarioId,
  TranscriptEntry,
} from "@/lib/types";

type Step = "pick" | "context" | "session" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("pick");
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId | null>(null);
  const [answers, setAnswers] = useState<ContextAnswers>({});
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null,
    [selectedScenarioId],
  );

  function reset() {
    setStep("pick");
    setSelectedScenarioId(null);
    setAnswers({});
    setFeedback(null);
    setTranscript([]);
  }

  return (
    <main className="app-shell">
      <header className="top-nav">
        <button className="brand" onClick={reset} type="button" aria-label="Negoshiate home">
          <span className="brand-mark" />
          Negoshiate
        </button>
        <div className="nav-meta">
          <span>Voice practice</span>
          <span>5 min / 12 turns</span>
        </div>
      </header>

      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">Conversation rehearsal</p>
          <h1>Practice the conversation before it counts.</h1>
          <p>
            Choose a scenario, tune the counterparty, rehearse out loud, then
            get a focused report tied to the transcript.
          </p>
        </div>
        <div className="hero-console" aria-label="Session summary">
          <div className="console-row">
            <span>Scenario</span>
            <strong>{selectedScenario?.shortTitle ?? "Choose one"}</strong>
          </div>
          <div className="console-row">
            <span>Context</span>
            <strong>{Object.keys(answers).length || "Pending"}</strong>
          </div>
          <div className="console-row">
            <span>Status</span>
            <strong>{step}</strong>
          </div>
        </div>
      </section>

      {step === "pick" ? (
        <section className="flow-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Select scenario</p>
              <h2>Three focused simulations</h2>
            </div>
            <button
              className="primary-button"
              disabled={!selectedScenarioId}
              onClick={() => setStep("context")}
              type="button"
            >
              Continue
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          </div>
          <ScenarioPicker
            scenarios={scenarios}
            selectedId={selectedScenarioId}
            onSelect={(id) => {
              setSelectedScenarioId(id);
              setAnswers({});
              setFeedback(null);
              setTranscript([]);
            }}
          />
        </section>
      ) : null}

      {step === "context" && selectedScenario ? (
        <section className="flow-section narrow">
          <ContextQuestionnaire
            answers={answers}
            onBack={() => setStep("pick")}
            onChange={setAnswers}
            onContinue={() => setStep("session")}
            scenario={selectedScenario}
          />
        </section>
      ) : null}

      {step === "session" && selectedScenario ? (
        <section className="flow-section">
          <VoiceSimulation
            answers={answers}
            onBack={() => setStep("context")}
            onFeedback={(nextFeedback, nextTranscript) => {
              setFeedback(nextFeedback);
              setTranscript(nextTranscript);
              setStep("results");
            }}
            scenario={selectedScenario}
          />
        </section>
      ) : null}

      {step === "results" && selectedScenario && feedback ? (
        <section className="flow-section">
          <FeedbackReport
            answers={answers}
            feedback={feedback}
            onRestart={reset}
            scenario={selectedScenario}
            transcript={transcript}
          />
        </section>
      ) : null}
    </main>
  );
}
