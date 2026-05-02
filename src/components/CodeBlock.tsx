import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { simulateRedis } from "@/lib/redisSimulator";
import type { Lesson, RedisKeyState } from "@/types";

interface Props {
  lesson: Lesson;
}

export function CodeBlock({ lesson }: Props) {
  const { t } = useTranslation();
  const timerRef = useRef<number | null>(null);
  const [draft, setDraft] = useState(lesson.commands);
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  const simulation = useMemo(
    () => simulateRedis(draft, lesson.initialState),
    [draft, lesson.initialState],
  );
  const currentSnapshot = simulation.snapshots[index] ?? null;
  const visibleState = currentSnapshot?.state ?? lesson.initialState;
  const replyLog = currentSnapshot
    ? simulation.snapshots.slice(0, index + 1).flatMap((snapshot) => snapshot.outputs).join("\n")
    : "";

  useEffect(() => {
    setDraft(lesson.commands);
    setIndex(0);
    setState("idle");
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, [lesson]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  function stopPlayback() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function run() {
    stopPlayback();
    setIndex(0);
    setState(simulation.snapshots.length === 0 ? "idle" : "running");

    if (simulation.snapshots.length === 0) return;

    let nextIndex = 0;
    timerRef.current = window.setInterval(() => {
      setIndex(nextIndex);
      nextIndex += 1;
      if (nextIndex >= simulation.snapshots.length) {
        stopPlayback();
        setState("done");
      }
    }, 900);
  }

  function reset() {
    stopPlayback();
    setDraft(lesson.commands);
    setIndex(0);
    setState("idle");
  }

  const noteLines = currentSnapshot
    ? [
        `step ${currentSnapshot.step}: ${currentSnapshot.command}`,
        currentSnapshot.changedKeys.length > 0
          ? `changed keys: ${currentSnapshot.changedKeys.join(", ")}`
          : "changed keys: none",
        lesson.visualFocus,
      ]
    : [
        "No commands have been replayed yet.",
        "Edit the mission script, then run it to animate each key mutation.",
        lesson.visualFocus,
      ];

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#081018] shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#07131f] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-300/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-500">
            redis mission
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={run}
            className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-400"
          >
            {state === "running" ? t("ui.running") : t("ui.runHere")}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
          >
            {t("ui.resetCode")}
          </button>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <section className="border-b border-white/10 xl:border-b-0 xl:border-r">
          <div className="border-b border-white/10 bg-emerald-500/8 px-4 py-2 text-xs text-emerald-100">
            Edit the commands. The simulator replays them step by step and animates the resulting Redis state.
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-[360px] w-full resize-y border-0 bg-[#081018] px-4 py-4 font-mono text-sm leading-7 text-zinc-100 outline-none"
            spellCheck={false}
          />
        </section>

        <section className="bg-zinc-950/90 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                simulation timeline
              </div>
              <div className="text-sm text-zinc-300">
                {simulation.snapshots.length} command steps
              </div>
            </div>
            {simulation.snapshots.length > 0 && (
              <input
                type="range"
                min={0}
                max={simulation.snapshots.length - 1}
                value={index}
                onChange={(event) => {
                  stopPlayback();
                  setState("done");
                  setIndex(Number(event.target.value));
                }}
                className="w-40 accent-emerald-400"
              />
            )}
          </div>

          <div className="mb-4 grid gap-3 lg:grid-cols-2">
            <TerminalPanel title={t("ui.stdout")} content={replyLog || t("ui.outputPlaceholder")} tone="emerald" />
            <TerminalPanel title={t("ui.stderr")} content={noteLines.join("\n")} tone="sky" />
          </div>

          {currentSnapshot?.queued && currentSnapshot.queued.length > 0 && (
            <div className="mb-4 rounded-[22px] border border-amber-400/20 bg-amber-500/10 p-4">
              <div className="mb-2 text-xs uppercase tracking-[0.16em] text-amber-200/80">
                transaction queue
              </div>
              <div className="space-y-2 font-mono text-sm text-amber-100">
                {currentSnapshot.queued.map((command) => (
                  <div key={command} className="rounded-2xl border border-amber-300/15 bg-black/20 px-3 py-2">
                    {command}
                  </div>
                ))}
              </div>
            </div>
          )}

          <RedisVisualizer state={visibleState} changedKeys={currentSnapshot?.changedKeys ?? []} />
        </section>
      </div>
    </div>
  );
}

function TerminalPanel({
  title,
  content,
  tone,
}: {
  title: string;
  content: string;
  tone: "emerald" | "sky";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-100 border-emerald-400/10"
      : "text-sky-100 border-sky-400/10";

  return (
    <section className={`rounded-[22px] border bg-black/25 p-4 ${toneClass}`}>
      <div className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</div>
      <pre className="app-scrollbar min-h-28 overflow-x-auto whitespace-pre-wrap text-sm leading-6">
        {content}
      </pre>
    </section>
  );
}

function RedisVisualizer({
  state,
  changedKeys,
}: {
  state: RedisKeyState[];
  changedKeys: string[];
}) {
  if (state.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
        No keys exist yet. The first write command will create them.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {state.map((entry) => {
        const highlighted = changedKeys.includes(entry.key);
        return (
          <article
            key={entry.key}
            className={`rounded-[24px] border p-4 transition ${
              highlighted
                ? "border-emerald-400/45 bg-emerald-500/10 shadow-lg shadow-emerald-950/20"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 font-mono text-xs text-zinc-100">
                {entry.key}
              </span>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100">
                {entry.type}
              </span>
              {entry.ttl != null && (
                <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-100">
                  ttl {entry.ttl}s
                </span>
              )}
            </div>
            <KeyValueView entry={entry} highlighted={highlighted} />
          </article>
        );
      })}
    </div>
  );
}

function KeyValueView({ entry, highlighted }: { entry: RedisKeyState; highlighted: boolean }) {
  const accent = highlighted ? "animate-pulse" : "";

  if (entry.type === "string") {
    return (
      <div className={`rounded-2xl border border-white/10 bg-[#07131f] px-4 py-5 font-mono text-2xl text-emerald-100 ${accent}`}>
        {entry.stringValue ?? "(nil)"}
      </div>
    );
  }

  if (entry.type === "hash") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(entry.hashValue ?? {}).map(([field, value]) => (
          <div key={field} className={`rounded-2xl border border-white/10 bg-[#07131f] px-3 py-3 ${accent}`}>
            <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">{field}</div>
            <div className="mt-1 font-mono text-sm text-zinc-100">{value}</div>
          </div>
        ))}
      </div>
    );
  }

  if (entry.type === "list") {
    return (
      <div className="flex flex-wrap gap-2">
        {(entry.listValue ?? []).map((item, index) => (
          <div key={`${item}-${index}`} className={`rounded-2xl border border-white/10 bg-[#07131f] px-4 py-3 font-mono text-sm text-zinc-100 ${accent}`}>
            {item}
          </div>
        ))}
      </div>
    );
  }

  if (entry.type === "set") {
    return (
      <div className="flex flex-wrap gap-2">
        {(entry.setValue ?? []).map((item) => (
          <div key={item} className={`rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-100 ${accent}`}>
            {item}
          </div>
        ))}
      </div>
    );
  }

  if (entry.type === "zset") {
    return (
      <div className="space-y-2">
        {(entry.zsetValue ?? []).map((item, index) => (
          <div key={item.member} className={`flex items-center justify-between rounded-2xl border border-white/10 bg-[#07131f] px-4 py-3 ${accent}`}>
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-xs font-semibold text-amber-200">
                {index + 1}
              </span>
              <span className="font-mono text-sm text-zinc-100">{item.member}</span>
            </div>
            <span className="font-mono text-sm text-emerald-100">{item.score}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(entry.streamValue ?? []).map((item) => (
        <div key={item.id} className={`rounded-2xl border border-white/10 bg-[#07131f] px-4 py-3 ${accent}`}>
          <div className="mb-2 font-mono text-xs text-zinc-500">{item.id}</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.fields).map(([field, value]) => (
              <span key={field} className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 font-mono text-xs text-fuchsia-100">
                {field}={value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
