import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Lesson } from "@/types";
import { isLessonUnlocked, lessonProgress, problemSolved, deepDiveSolved, interviewSolved } from "@/lib/store";
import { problems } from "@/data/problems";
import { useProgressVersion } from "@/lib/useProgressVersion";
import { deepDiveQuestions } from "@/data/deepDive";
import { interviewQuestions } from "@/data/interview";

interface Props {
  lessons: Lesson[];
}

function stageLabel(level: Lesson["difficulty"]) {
  if (level === "starter") return "starter";
  if (level === "intermediate") return "intermediate";
  return "professional";
}

export function Sidebar({ lessons }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const progressVersion = useProgressVersion();

  const totalDone = useMemo(
    () => lessons.filter((lesson) => lessonProgress(lesson.id, lesson.quizzes.length).done).length,
    [lessons, progressVersion],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lessons
      .map((lesson, index) => ({ lesson, index }))
      .filter(({ lesson }) => {
        if (!normalized) return true;
        return [lesson.title, lesson.topic, lesson.id, lesson.difficulty].some((value) =>
          value.toLowerCase().includes(normalized),
        );
      });
  }, [lessons, query]);

  const percent = lessons.length === 0 ? 0 : Math.round((totalDone / lessons.length) * 100);
  const solvedProblems = useMemo(() => problems.filter((problem) => problemSolved(problem.id)).length, [progressVersion]);
  const solvedDeepDive = useMemo(() => deepDiveQuestions.filter((question) => deepDiveSolved(question.id)).length, [progressVersion]);
  const solvedInterview = useMemo(() => interviewQuestions.filter((question) => interviewSolved(question.id)).length, [progressVersion]);

  return (
    <aside className="border-b border-white/10 bg-zinc-950/80 lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="app-scrollbar flex h-full flex-col overflow-y-auto">
        <div className="border-b border-white/10 px-4 py-4 lg:px-5">
          <div className="rounded-[24px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/12 via-zinc-950 to-zinc-950 px-4 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/70">Course map</div>
                <h2 className="mt-1 text-xl font-semibold text-zinc-50">{t("ui.lessons")}</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300">
                {totalDone}/{lessons.length}
              </div>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-sky-300 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-sm leading-6 text-zinc-300">{t("ui.keyboardHint")}</p>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("ui.search")}
              className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="space-y-3 px-3 py-4 lg:px-4">
          {filtered.map(({ lesson, index }) => {
            const unlocked = isLessonUnlocked(index, lessons);
            const progress = lessonProgress(lesson.id, lesson.quizzes.length);

            return (
              <NavLink
                key={lesson.id}
                to={unlocked ? `/lesson/${lesson.id}` : "#"}
                onClick={(event) => !unlocked && event.preventDefault()}
                className={({ isActive }) =>
                  [
                    "group block rounded-[22px] border px-4 py-3 transition",
                    unlocked
                      ? "border-white/10 bg-white/[0.045] hover:border-emerald-400/35 hover:bg-emerald-500/8"
                      : "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-45",
                    isActive && "border-emerald-400/55 bg-emerald-500/12 shadow-lg shadow-emerald-950/25",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-zinc-900 font-mono text-xs text-zinc-300">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">{stageLabel(lesson.difficulty)}</div>
                      <div className="text-sm font-medium text-zinc-100">{lesson.title}</div>
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
                    {progress.done ? "done" : `${progress.completed}/${progress.total}`}
                  </div>
                </div>
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">{lesson.topic}</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all"
                    style={{ width: `${Math.round((progress.completed / progress.total) * 100) || 0}%` }}
                  />
                </div>
              </NavLink>
            );
          })}

          <ExtraCard
            to="/ps"
            label="mission drills"
            title="Command Missions"
            summary="Order the right Redis commands for cache, rate limit, leaderboard, and replayable event scenarios."
            solved={solvedProblems}
            total={problems.length}
            color="sky"
          />
          <ExtraCard
            to="/interview"
            label="architecture section"
            title="Interview Deep Dive"
            summary="Junior to senior Redis design questions on topology, caching, pipelines, cluster slots, and failure modes."
            solved={solvedInterview}
            total={interviewQuestions.length}
            color="cyan"
          />
          <ExtraCard
            to="/deep-dive"
            label="advanced section"
            title="Operational Reasoning"
            summary="Harder questions about eviction, replication lag, scripting, durable events, and distributed lock limits."
            solved={solvedDeepDive}
            total={deepDiveQuestions.length}
            color="fuchsia"
          />
        </div>
      </div>
    </aside>
  );
}

function ExtraCard({
  to,
  label,
  title,
  summary,
  solved,
  total,
  color,
}: {
  to: string;
  label: string;
  title: string;
  summary: string;
  solved: number;
  total: number;
  color: "sky" | "cyan" | "fuchsia";
}) {
  const tone =
    color === "fuchsia"
      ? "border-fuchsia-400/18 bg-fuchsia-500/8 hover:border-fuchsia-300/35 hover:bg-fuchsia-500/12"
      : "border-sky-400/18 bg-sky-500/8 hover:border-sky-300/35 hover:bg-sky-500/12";
  const activeTone =
    color === "fuchsia"
      ? "border-fuchsia-300/55 bg-fuchsia-500/14 shadow-lg shadow-fuchsia-950/25"
      : "border-sky-300/55 bg-sky-500/14 shadow-lg shadow-sky-950/25";
  const gradient =
    color === "fuchsia"
      ? "from-fuchsia-400 to-purple-300"
      : color === "cyan"
        ? "from-cyan-400 to-sky-300"
        : "from-sky-400 to-cyan-300";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => ["block rounded-[22px] border px-4 py-4 transition", tone, isActive && activeTone].filter(Boolean).join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-sky-100/70">{label}</div>
          <div className="text-sm font-medium text-zinc-100">{title}</div>
        </div>
        <div className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-zinc-300">
          {solved}/{total}
        </div>
      </div>
      <div className="mb-3 text-sm leading-6 text-zinc-300">{summary}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          style={{ width: `${Math.round((solved / total) * 100) || 0}%` }}
        />
      </div>
    </NavLink>
  );
}
