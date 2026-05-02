const KEY = "learningredis:progress:v1";
const EVENT = "learningredis:progress";

interface Progress {
  completedQuizzes: Record<string, true>;
  solvedProblems?: Record<string, true>;
  solvedDeepDive?: Record<string, true>;
  solvedInterview?: Record<string, true>;
}

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { completedQuizzes: {} };
    return JSON.parse(raw) as Progress;
  } catch {
    return { completedQuizzes: {} };
  }
}

function write(progress: Progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}

export function progressEventName() {
  return EVENT;
}

export function isQuizCompleted(lessonId: string, quizId: string) {
  return read().completedQuizzes[`${lessonId}:${quizId}`] === true;
}

export function markQuizCompleted(lessonId: string, quizId: string) {
  const progress = read();
  progress.completedQuizzes[`${lessonId}:${quizId}`] = true;
  write(progress);
}

export function lessonProgress(lessonId: string, quizCount: number) {
  const progress = read();
  const completed = Object.keys(progress.completedQuizzes).filter((key) =>
    key.startsWith(`${lessonId}:`)
  ).length;
  return { completed, total: quizCount, done: completed >= quizCount };
}

export function isLessonUnlocked(
  lessonIndex: number,
  lessons: { id: string; quizzes: { id: string }[] }[],
) {
  if (lessonIndex === 0) return true;
  const previous = lessons[lessonIndex - 1];
  return lessonProgress(previous.id, previous.quizzes.length).done;
}

export function problemSolved(problemId: string) {
  return read().solvedProblems?.[problemId] === true;
}

export function markProblemSolved(problemId: string) {
  const progress = read();
  progress.solvedProblems ??= {};
  progress.solvedProblems[problemId] = true;
  write(progress);
}

export function deepDiveSolved(questionId: string) {
  return read().solvedDeepDive?.[questionId] === true;
}

export function markDeepDiveSolved(questionId: string) {
  const progress = read();
  progress.solvedDeepDive ??= {};
  progress.solvedDeepDive[questionId] = true;
  write(progress);
}

export function interviewSolved(questionId: string) {
  return read().solvedInterview?.[questionId] === true;
}

export function markInterviewSolved(questionId: string) {
  const progress = read();
  progress.solvedInterview ??= {};
  progress.solvedInterview[questionId] = true;
  write(progress);
}
