import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Lesson as LessonType } from "@/types";
import { CodeBlock } from "@/components/CodeBlock";
import { LessonDescription } from "@/components/LessonDescription";
import { PredictOutput } from "@/components/quiz/PredictOutput";
import { MultipleChoice } from "@/components/quiz/MultipleChoice";
import { FillInBlank } from "@/components/quiz/FillInBlank";
import { SpotTheBug } from "@/components/quiz/SpotTheBug";
import { OrderStatements } from "@/components/quiz/OrderStatements";
import { useKeyboardNav } from "@/lib/keyboardNav";
import { lessonProgress } from "@/lib/store";
import { useProgressVersion } from "@/lib/useProgressVersion";

interface Props {
  lessons: LessonType[];
}

export function Lesson({ lessons }: Props) {
  const { id } = useParams();
  const { t } = useTranslation();
  const [, setRefresh] = useState(0);
  useProgressVersion();
  useKeyboardNav(lessons, id);

  const lesson = lessons.find((entry) => entry.id === id);
  if (!lesson) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-zinc-400">
        {t("ui.lessonNotFound")}
      </main>
    );
  }

  const refresh = () => setRefresh((value) => value + 1);
  const progress = lessonProgress(lesson.id, lesson.quizzes.length);
  const lessonIndex = lessons.findIndex((entry) => entry.id === lesson.id);
  const allDone = lessons.every((entry) => lessonProgress(entry.id, entry.quizzes.length).done);

  return (
    <main className="app-scrollbar flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_24%),linear-gradient(180deg,rgba(4,8,12,0.86),rgba(4,8,12,0.98))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:px-6 lg:py-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="rounded-[30px] border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/25">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-200">
                lesson {String(lessonIndex + 1).padStart(2, "0")}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                {lesson.topic}
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100">
                {lesson.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 lg:text-4xl">{lesson.title}</h1>
            <LessonDescription content={lesson.description} />
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#0a121a] p-5 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">progress</div>
              <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-zinc-300">
                {progress.completed}/{progress.total}
              </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-sky-300 transition-all"
                style={{ width: `${Math.round((progress.completed / progress.total) * 100) || 0}%` }}
              />
            </div>
            <div className="space-y-3 text-sm leading-7 text-zinc-300">
              {lesson.objectives.map((objective) => (
                <div key={objective} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                  <span>{objective}</span>
                </div>
              ))}
            </div>
            {allDone && (
              <div className="mt-5 rounded-[22px] border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {t("ui.courseComplete")}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="space-y-6">
            <CodeBlock lesson={lesson} />
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-5">
              <div className="mb-1 text-xs uppercase tracking-[0.14em] text-zinc-500">quiz set</div>
              <h2 className="text-xl font-semibold text-zinc-50">{t("ui.quizzes")}</h2>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Clear every quiz to unlock the next Redis mission.
              </p>
            </div>
            {progress.done && (
              <div className="rounded-[24px] border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {t("ui.lessonComplete")}
              </div>
            )}

            {lesson.quizzes.map((quiz) => {
              switch (quiz.type) {
                case "predict-output":
                  return (
                    <PredictOutput
                      key={`${lesson.id}-${quiz.id}`}
                      lessonId={lesson.id}
                      quizId={quiz.id}
                      question={quiz.question}
                      expectedOutput={lesson.expectedOutput}
                      onSolved={refresh}
                    />
                  );
                case "multiple-choice":
                  return (
                    <MultipleChoice
                      key={`${lesson.id}-${quiz.id}`}
                      lessonId={lesson.id}
                      quizId={quiz.id}
                      question={quiz.question}
                      options={quiz.options}
                      answer={quiz.answer}
                      explanations={quiz.explanations}
                      answerReason={quiz.answerReason}
                      onSolved={refresh}
                    />
                  );
                case "fill-in-blank":
                  return (
                    <FillInBlank
                      key={`${lesson.id}-${quiz.id}`}
                      lessonId={lesson.id}
                      quizId={quiz.id}
                      question={quiz.question}
                      template={quiz.template}
                      blanks={quiz.blanks}
                      onSolved={refresh}
                    />
                  );
                case "spot-the-bug":
                  return (
                    <SpotTheBug
                      key={`${lesson.id}-${quiz.id}`}
                      lessonId={lesson.id}
                      quizId={quiz.id}
                      question={quiz.question}
                      code={quiz.code}
                      buggyLine={quiz.buggyLine}
                      onSolved={refresh}
                    />
                  );
                case "order-statements":
                  return (
                    <OrderStatements
                      key={`${lesson.id}-${quiz.id}`}
                      lessonId={lesson.id}
                      quizId={quiz.id}
                      question={quiz.question}
                      options={quiz.options}
                      answer={quiz.answer}
                      onSolved={refresh}
                    />
                  );
              }
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
