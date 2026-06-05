"use client";

import { Download, RotateCcw } from "lucide-react";
import { buildMarkdownDownload, downloadMarkdown } from "@/lib/downloads";
import type {
  ContextAnswers,
  FeedbackResponse,
  Scenario,
  TranscriptEntry,
} from "@/lib/types";

export function FeedbackReport({
  scenario,
  answers,
  feedback,
  transcript,
  onRestart,
}: {
  scenario: Scenario;
  answers: ContextAnswers;
  feedback: FeedbackResponse;
  transcript: TranscriptEntry[];
  onRestart: () => void;
}) {
  const download = () => {
    const date = new Date().toISOString().slice(0, 10);
    const markdown = buildMarkdownDownload({
      scenario,
      answers,
      feedback,
      transcript,
    });
    downloadMarkdown(`negoshiate-${scenario.id}-${date}.md`, markdown);
  };

  return (
    <section className="results-layout">
      <div className="panel report-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Feedback report</p>
            <h2>{scenario.title}</h2>
          </div>
          <div className="button-row compact">
            <button className="secondary-button" onClick={onRestart} type="button">
              <RotateCcw aria-hidden="true" size={16} />
              Restart
            </button>
            <button className="primary-button" onClick={download} type="button">
              <Download aria-hidden="true" size={16} />
              Download
            </button>
          </div>
        </div>

        <div className="assessment-block">
          <h3>Overall assessment</h3>
          <p>{feedback.overallAssessment}</p>
        </div>

        <div className="report-columns">
          <ReportList title="What worked" items={feedback.whatWorked} />
          <ReportList title="What to improve" items={feedback.whatToImprove} />
        </div>

        <div className="report-columns">
          <div className="report-card">
            <h3>Best moment</h3>
            <p>{feedback.bestMoment}</p>
          </div>
          <div className="report-card">
            <h3>Missed opportunity</h3>
            <p>{feedback.missedOpportunity}</p>
          </div>
        </div>

        <div className="scorecard">
          <h3>Scenario scorecard</h3>
          {feedback.scorecard.map((item) => (
            <div className="score-row" key={item.label}>
              <div>
                <span>{item.label}</span>
                <p>{item.note}</p>
              </div>
              <strong>{item.score}/5</strong>
            </div>
          ))}
        </div>

        <ReportList
          title="Suggested replacement lines"
          items={feedback.suggestedReplacementLines}
        />

        <div className="assessment-block">
          <h3>Recommended retry strategy</h3>
          <p>{feedback.retryStrategy}</p>
        </div>
      </div>

      <aside className="panel transcript-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Session transcript</p>
            <h2>{transcript.length} turns</h2>
          </div>
        </div>
        <div className="transcript-list">
          {transcript.length ? (
            transcript.map((entry, index) => (
              <div className={`transcript-entry ${entry.role}`} key={`${entry.role}-${index}`}>
                <span>{entry.role === "agent" ? "Agent" : "You"}</span>
                <p>{entry.text}</p>
              </div>
            ))
          ) : (
            <p className="muted">No transcript was captured.</p>
          )}
        </div>
      </aside>
    </section>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="report-card">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
