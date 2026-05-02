import { useMemo, useState } from "react";
import { markProblemSolved, problemSolved } from "@/lib/store";
import { problems } from "@/data/problems";
import { useProgressVersion } from "@/lib/useProgressVersion";

function difficultyTone(level: "easy" | "medium" | "hard") {
  if (level === "easy") return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
  if (level === "medium") return "border-amber-400/25 bg-amber-500/10 text-amber-100";
  return "border-rose-400/25 bg-rose-500/10 text-rose-100";
}

export function ProblemSolving() {
  const progressVersion = useProgressVersion();
  const totalSolved = useMemo(() => problems.filter((problem) => problemSolved(problem.id)).length, [progressVersion]);

  return (
    <main className="app-scrollbar flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_24%),linear-gradient(180deg,rgba(4,8,12,0.86),rgba(4,8,12,0.98))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:px-6 lg:py-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="rounded-[30px] border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/25">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-100">
                command missions
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                {problems.length} drills
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 lg:text-4xl">
              Scenario-based Redis command games
            </h1>
            <div className="mt-4 space-y-3 text-base leading-8 text-zinc-300">
              <p>These are not syntax flash cards. Each drill starts from a production-style need.</p>
              <p>Your job is to assemble the command sequence in the right order so the data model matches the requirement.</p>
              <p>The set deliberately mixes basic rate limiting with harder cache coordination and event replay patterns.</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#0a121a] p-5 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">mission progress</div>
              <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-zinc-300">
                {totalSolved}/{problems.length}
              </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-300"
                style={{ width: `${Math.round((totalSolved / problems.length) * 100) || 0}%` }}
              />
            </div>
            <div className="space-y-3 font-mono text-sm leading-7 text-zinc-300">
              <div><span className="text-emerald-300">$</span> choose the primitive, then the order</div>
              <div className="text-zinc-500">1. Read the scenario.</div>
              <div className="text-zinc-500">2. Build the command sequence.</div>
              <div className="text-zinc-500">3. Compare with the reasoning after validation.</div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problemId={problem.id} />
          ))}
        </section>
      </div>
    </main>
  );
}

function ProblemCard({ problemId }: { problemId: string }) {
  const problem = problems.find((entry) => entry.id === problemId)!;
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const solved = problemSolved(problem.id);
  const isCorrect =
    checked &&
    order.length === problem.expectedCommandOrder.length &&
    order.every((value, index) => problem.commandBank[value] === problem.expectedCommandOrder[index]);

  function pick(index: number) {
    if (solved || order.includes(index)) return;
    setOrder((current) => [...current, index]);
  }

  function remove(index: number) {
    if (solved) return;
    setOrder((current) => current.filter((value) => value !== index));
  }

  function validate() {
    setChecked(true);
    const ok =
      order.length === problem.expectedCommandOrder.length &&
      order.every((value, index) => problem.commandBank[value] === problem.expectedCommandOrder[index]);
    if (ok) markProblemSolved(problem.id);
  }

  return (
    <article className="rounded-[30px] border border-white/10 bg-zinc-950/80 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">{problem.id}</div>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-50">{problem.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">{problem.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${difficultyTone(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {solved && (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-100">
              solved
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-5">
          <SectionList title="Scenario" items={problem.scenario} />
          <SectionList title="Why this order" items={problem.explanation} />
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-1 text-xs uppercase tracking-[0.14em] text-zinc-500">assembly board</div>
            <h3 className="text-lg font-semibold text-zinc-50">Build the command sequence</h3>
            <p className="mt-2 text-sm leading-7 text-zinc-300">
              Pick the commands in the order you would execute them.
            </p>
          </div>

          <div className="rounded-[24px] border border-dashed border-white/15 p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-500">Your order</div>
            <div className="space-y-2">
              {order.length === 0 && <div className="text-sm italic text-zinc-500">Choose commands below.</div>}
              {order.map((itemIndex, position) => (
                <button
                  key={`${itemIndex}-${position}`}
                  type="button"
                  onClick={() => remove(itemIndex)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-left font-mono text-sm text-zinc-100"
                >
                  <span className="w-6 shrink-0 font-semibold text-sky-200">{position + 1}.</span>
                  <span className="flex-1">{problem.commandBank[itemIndex]}</span>
                  {!solved && <span className="text-xs text-zinc-500">×</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-500">Command bank</div>
            <div className="space-y-2">
              {problem.commandBank.map((command, index) => {
                const used = order.includes(index);
                return (
                  <button
                    key={command}
                    type="button"
                    onClick={() => pick(index)}
                    disabled={used || solved}
                    className={`w-full rounded-2xl border px-3 py-2 text-left font-mono text-sm ${
                      used
                        ? "border-white/10 bg-white/[0.04] text-zinc-600"
                        : "border-white/10 bg-zinc-950 text-zinc-100 hover:border-sky-400/40 hover:bg-sky-500/10"
                    }`}
                  >
                    {command}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={validate}
              disabled={order.length !== problem.expectedCommandOrder.length}
              className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:bg-zinc-700"
            >
              Validate order
            </button>
            {checked && isCorrect && (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                Correct. That sequence fits the scenario.
              </div>
            )}
            {checked && !isCorrect && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                The order is off. Recheck the dependency between the commands.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-500">{title}</div>
      <ul className="space-y-2 text-sm leading-7 text-zinc-300">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
