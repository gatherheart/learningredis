import { useMemo, useState } from "react";
import { deepDiveQuestions } from "@/data/deepDive";
import { deepDiveSolved, markDeepDiveSolved } from "@/lib/store";
import { useProgressVersion } from "@/lib/useProgressVersion";

export function DeepDive() {
  const progressVersion = useProgressVersion();
  const solvedCount = useMemo(
    () => deepDiveQuestions.filter((question) => deepDiveSolved(question.id)).length,
    [progressVersion],
  );

  return (
    <main className="app-scrollbar flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.16),transparent_24%),linear-gradient(180deg,rgba(4,8,12,0.86),rgba(4,8,12,0.98))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:px-6 lg:py-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="rounded-[30px] border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/25">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100">
                operational reasoning
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                advanced tradeoffs
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 lg:text-4xl">
              Redis questions beyond command memorization
            </h1>
            <div className="mt-4 space-y-3 text-base leading-8 text-zinc-300">
              <p>These are for the point where `SET`, `GET`, and `ZADD` are already easy.</p>
              <p>The real skill is reasoning about memory pressure, topology, stale reads, scripting, event retention, and failure boundaries.</p>
              <p>Use this section when you want to pressure-test architecture instincts, not just syntax recall.</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#0a121a] p-5 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">deep progress</div>
              <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-zinc-300">
                {solvedCount}/{deepDiveQuestions.length}
              </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-indigo-300"
                style={{ width: `${Math.round((solvedCount / deepDiveQuestions.length) * 100) || 0}%` }}
              />
            </div>
            <div className="space-y-3 font-mono text-sm leading-7 text-zinc-300">
              <div><span className="text-emerald-300">$</span> model the failure before the feature</div>
              <div className="text-zinc-500">1. Read the scenario carefully.</div>
              <div className="text-zinc-500">2. Pick the strongest explanation.</div>
              <div className="text-zinc-500">3. Review why the weaker answers miss the real issue.</div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {deepDiveQuestions.map((question, index) => (
            <DeepDiveCard key={question.id} question={question} index={index} />
          ))}
        </section>
      </div>
    </main>
  );
}

function DeepDiveCard({ question, index }: { question: (typeof deepDiveQuestions)[number]; index: number }) {
  const solved = deepDiveSolved(question.id);
  const [selected, setSelected] = useState<number | null>(solved ? question.answer : null);
  const [state, setState] = useState<"idle" | "right" | "wrong">(solved ? "right" : "idle");

  function check() {
    if (selected === null) return;
    if (selected === question.answer) {
      setState("right");
      markDeepDiveSolved(question.id);
    } else {
      setState("wrong");
    }
  }

  return (
    <article className="rounded-[30px] border border-white/10 bg-zinc-950/80 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            {String(index + 1).padStart(2, "0")} • {question.topic}
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-50">{question.title}</h2>
        </div>
        {solved && (
          <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-100">
            solved
          </span>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-500">Scenario</div>
          <ul className="space-y-2 text-sm leading-7 text-zinc-300">
            {question.scenario.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 text-sm font-semibold text-zinc-100">{question.question}</div>
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <label
                key={option}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-sm ${
                  selected === optionIndex
                    ? "border-fuchsia-400/55 bg-fuchsia-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-fuchsia-400/30"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected === optionIndex}
                  onChange={() => setSelected(optionIndex)}
                  className="mt-1"
                />
                <span className="leading-7 text-zinc-100">{option}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={check}
              disabled={selected === null}
              className="rounded-2xl bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-fuchsia-400 disabled:bg-zinc-700"
            >
              Check reasoning
            </button>
            {state === "right" && <span className="text-sm font-medium text-emerald-300">✓ Correct</span>}
          </div>
          {state !== "idle" && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-7 ${
              state === "right"
                ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                : "border-red-400/25 bg-red-500/10 text-red-100"
            }`}>
              <div className="font-medium">{state === "right" ? "Why this is right" : "Why your choice is weak"}</div>
              <div>{question.explanation}</div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
