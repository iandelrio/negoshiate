"use client";

import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import { getQuestionsForScenario } from "@/lib/questions";
import type { ContextAnswers, Scenario } from "@/lib/types";

export function ContextQuestionnaire({
  scenario,
  answers,
  onChange,
  onBack,
  onContinue,
}: {
  scenario: Scenario;
  answers: ContextAnswers;
  onChange: (answers: ContextAnswers) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const questions = getQuestionsForScenario(scenario.id);
  const completed = questions.filter((question) => answers[question.id]?.trim()).length;
  const canContinue = completed >= Math.min(3, questions.length);

  function setAnswer(id: string, value: string) {
    onChange({ ...answers, [id]: value });
  }

  function appendFreeText(id: string, value: string) {
    const current = answers[id] ?? "";
    const selected = current.split(" - ")[0];
    setAnswer(id, selected ? `${selected} - ${value}` : value);
  }

  return (
    <section className="panel questionnaire-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Session context</p>
          <h2>{scenario.title}</h2>
        </div>
        <span className="progress-pill">{completed}/{questions.length}</span>
      </div>

      <div className="question-list">
        {questions.map((question) => (
          <fieldset className="question-block" key={question.id}>
            <legend>
              {question.label}
              <span>{question.kind === "user_fact" ? "User fact" : "Agent behavior"}</span>
            </legend>
            <div className="pill-row">
              {question.options.map((option) => (
                <button
                  className={`option-pill ${
                    answers[question.id]?.startsWith(option) ? "active" : ""
                  }`}
                  key={option}
                  onClick={() => setAnswer(question.id, option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
              {question.allowSurpriseMe ? (
                <button
                  className={`option-pill surprise ${
                    answers[question.id] === "Surprise me" ? "active" : ""
                  }`}
                  onClick={() => setAnswer(question.id, "Surprise me")}
                  type="button"
                >
                  <Shuffle aria-hidden="true" size={14} />
                  Surprise me
                </button>
              ) : null}
            </div>
            {question.freeTextPlaceholder ? (
              <input
                className="context-input"
                onChange={(event) => appendFreeText(question.id, event.target.value)}
                placeholder={question.freeTextPlaceholder}
                type="text"
              />
            ) : null}
          </fieldset>
        ))}
      </div>

      <div className="button-row">
        <button className="secondary-button" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={17} />
          Back
        </button>
        <button
          className="primary-button"
          disabled={!canContinue}
          onClick={onContinue}
          type="button"
        >
          Continue
          <ArrowRight aria-hidden="true" size={17} />
        </button>
      </div>
    </section>
  );
}
