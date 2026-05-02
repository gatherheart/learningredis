import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isQuizCompleted, markQuizCompleted } from "@/lib/store";

interface Props {
  lessonId: string;
  quizId: string;
  question: string;
  options: string[];
  answer: number[];
  onSolved: () => void;
}

export function OrderStatements({ lessonId, quizId, question, options, answer, onSolved }: Props) {
  const { t } = useTranslation();
  const alreadyDone = isQuizCompleted(lessonId, quizId);
  const [order, setOrder] = useState<number[]>(alreadyDone ? answer.slice() : []);
  const [state, setState] = useState<"idle" | "wrong" | "right">(alreadyDone ? "right" : "idle");

  function pick(index: number) {
    if (alreadyDone || order.includes(index)) return;
    setOrder([...order, index]);
  }

  function remove(index: number) {
    if (alreadyDone) return;
    setOrder(order.filter((item) => item !== index));
  }

  function check() {
    const ok = order.length === answer.length && order.every((value, index) => value === answer[index]);
    if (ok) {
      setState("right");
      markQuizCompleted(lessonId, quizId);
      onSolved();
    } else {
      setState("wrong");
    }
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-zinc-950/80 p-4">
      <div className="mb-3 text-sm font-semibold text-zinc-100">{question}</div>
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{t("ui.yourOrder")}</div>
      <ol className="mb-3 min-h-[2.5rem] space-y-1.5 rounded-2xl border border-dashed border-white/15 p-2">
        {order.length === 0 && <li className="text-sm italic text-zinc-500">{t("ui.tapItemsBelow")}</li>}
        {order.map((itemIndex, position) => (
          <li key={`${itemIndex}-${position}`}>
            <button
              type="button"
              onClick={() => remove(itemIndex)}
              disabled={alreadyDone}
              className="flex w-full items-start gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-left font-mono text-sm text-zinc-100"
            >
              <span className="w-6 shrink-0 font-semibold text-emerald-200">{position + 1}.</span>
              <span className="flex-1">{options[itemIndex]}</span>
              {!alreadyDone && <span className="text-xs text-zinc-500">×</span>}
            </button>
          </li>
        ))}
      </ol>

      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{t("ui.available")}</div>
      <div className="space-y-1.5">
        {options.map((label, index) => {
          const used = order.includes(index);
          return (
            <button
              key={label}
              type="button"
              onClick={() => pick(index)}
              disabled={used || alreadyDone}
              className={`w-full rounded border px-3 py-1.5 text-left font-mono text-sm ${
                used
                  ? "border-white/10 bg-white/[0.04] text-zinc-600"
                  : "border-white/10 bg-white/[0.03] text-zinc-100 hover:border-emerald-400/40 hover:bg-emerald-500/10"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {!alreadyDone && (
          <button
            onClick={check}
            disabled={order.length !== options.length}
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:bg-zinc-700"
          >
            {t("ui.check")}
          </button>
        )}
        {state === "right" && <span className="text-sm font-medium text-emerald-300">✓ {t("ui.correct")}</span>}
        {state === "wrong" && <span className="text-sm font-medium text-red-300">✗ {t("ui.tryAgain")}</span>}
      </div>
    </div>
  );
}
