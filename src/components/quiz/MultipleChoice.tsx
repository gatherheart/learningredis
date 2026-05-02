import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isQuizCompleted, markQuizCompleted } from "@/lib/store";

interface Props {
  lessonId: string;
  quizId: string;
  question: string;
  options: string[];
  answer: number;
  explanations?: string[];
  answerReason?: string;
  onSolved: () => void;
}

export function MultipleChoice({
  lessonId,
  quizId,
  question,
  options,
  answer,
  explanations = [],
  answerReason = "",
  onSolved,
}: Props) {
  const { t } = useTranslation();
  const alreadyDone = isQuizCompleted(lessonId, quizId);
  const [selected, setSelected] = useState<number | null>(alreadyDone ? answer : null);
  const [state, setState] = useState<"idle" | "wrong" | "right">(alreadyDone ? "right" : "idle");

  function check() {
    if (selected === answer) {
      setState("right");
      markQuizCompleted(lessonId, quizId);
      onSolved();
    } else {
      setState("wrong");
    }
  }

  const wrongReason =
    selected !== null && explanations[selected] ? explanations[selected] : t("ui.incorrectReasonFallback");

  return (
    <div className="rounded-[24px] border border-white/10 bg-zinc-950/80 p-4">
      <div className="mb-3 text-sm font-semibold text-zinc-100">{question}</div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={option}
            className={`flex cursor-pointer items-start gap-2 rounded border p-2 text-sm ${
              selected === index
                ? "border-emerald-400/60 bg-emerald-500/10"
                : "border-white/10 bg-white/[0.03] hover:border-emerald-400/30"
            } ${alreadyDone ? "cursor-default" : ""}`}
          >
            <input
              type="radio"
              name={`${lessonId}-${quizId}`}
              checked={selected === index}
              disabled={alreadyDone}
              onChange={() => setSelected(index)}
              className="mt-0.5"
            />
            <span className="whitespace-pre-wrap font-mono text-zinc-100">{option}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {!alreadyDone && (
          <button
            onClick={check}
            disabled={selected === null}
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:bg-zinc-700"
          >
            {t("ui.check")}
          </button>
        )}
        {state === "right" && <span className="text-sm font-medium text-emerald-300">✓ {t("ui.correct")}</span>}
        {state === "wrong" && (
          <div className="space-y-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div className="font-medium">✗ {t("ui.tryAgain")}</div>
            <div>{wrongReason}</div>
            {answerReason && <div className="text-red-100/90">{answerReason}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
