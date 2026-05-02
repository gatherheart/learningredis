export type QuizType =
  | "predict-output"
  | "multiple-choice"
  | "fill-in-blank"
  | "spot-the-bug"
  | "order-statements";

export interface QuizPredictOutput {
  id: string;
  type: "predict-output";
  question: string;
}

export interface QuizMultipleChoice {
  id: string;
  type: "multiple-choice";
  question: string;
  options: string[];
  answer: number;
  explanations?: string[];
  answerReason?: string;
}

export interface QuizFillInBlank {
  id: string;
  type: "fill-in-blank";
  question: string;
  template: string;
  blanks: string[];
}

export interface QuizSpotTheBug {
  id: string;
  type: "spot-the-bug";
  question: string;
  code: string;
  buggyLine: number;
}

export interface QuizOrderStatements {
  id: string;
  type: "order-statements";
  question: string;
  options: string[];
  answer: number[];
}

export type Quiz =
  | QuizPredictOutput
  | QuizMultipleChoice
  | QuizFillInBlank
  | QuizSpotTheBug
  | QuizOrderStatements;

export type RedisValueType =
  | "string"
  | "hash"
  | "list"
  | "set"
  | "zset"
  | "stream";

export interface RedisStreamEntry {
  id: string;
  fields: Record<string, string>;
}

export interface RedisStreamGroup {
  name: string;
  cursor: number;
  pending: string[];
}

export interface RedisKeyState {
  key: string;
  type: RedisValueType;
  ttl?: number | null;
  stringValue?: string;
  hashValue?: Record<string, string>;
  listValue?: string[];
  setValue?: string[];
  zsetValue?: Array<{ member: string; score: number }>;
  streamValue?: RedisStreamEntry[];
  streamGroups?: RedisStreamGroup[];
}

export interface Lesson {
  id: string;
  topic: string;
  difficulty: "starter" | "intermediate" | "professional";
  title: string;
  description: string;
  objectives: string[];
  commands: string;
  expectedOutput: string;
  visualFocus: string;
  initialState: RedisKeyState[];
  quizzes: Quiz[];
}

export interface Mission {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  summary: string;
  scenario: string[];
  expectedCommandOrder: string[];
  commandBank: string[];
  explanation: string[];
}

export interface DeepDiveQuestion {
  id: string;
  topic: string;
  title: string;
  scenario: string[];
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface InterviewQuestion {
  id: string;
  level: "junior" | "mid" | "senior";
  topic: string;
  title: string;
  prompt: string[];
  options: string[];
  answer: number;
  explanation: string;
}
