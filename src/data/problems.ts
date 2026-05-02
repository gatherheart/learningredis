import type { Mission } from "@/types";

export const problems: Mission[] = [
  {
    id: "cache_stampede",
    title: "Cache Stampede Drill",
    difficulty: "medium",
    summary: "Choose the command sequence that prevents many workers from rebuilding the same cache entry at once.",
    scenario: [
      "A hot key expires and 200 requests hit the API together.",
      "Only one worker should rebuild the cache payload.",
      "Everyone else should either serve stale data briefly or wait.",
    ],
    expectedCommandOrder: [
      "SET rebuild:bossfight worker-17 NX PX 5000",
      "GET cache:bossfight",
      "SET cache:bossfight payload EX 60",
      "DEL rebuild:bossfight",
    ],
    commandBank: [
      "DEL rebuild:bossfight",
      "SET rebuild:bossfight worker-17 NX PX 5000",
      "SET cache:bossfight payload EX 60",
      "GET cache:bossfight",
    ],
    explanation: [
      "The lock key with `NX PX` is the coordination primitive.",
      "Read the old cache entry before rebuilding if your design allows stale fallback.",
      "Write the fresh value, then release the rebuild lock.",
    ],
  },
  {
    id: "rate_limit_window",
    title: "Rate Limit Window",
    difficulty: "easy",
    summary: "Assemble the commands for a fixed-window limiter on one player action key.",
    scenario: [
      "A player can cast a spell at most 5 times per minute.",
      "The counter should disappear when the minute is over.",
    ],
    expectedCommandOrder: [
      "INCR rate:spell:bean",
      "EXPIRE rate:spell:bean 60",
      "GET rate:spell:bean",
    ],
    commandBank: [
      "GET rate:spell:bean",
      "INCR rate:spell:bean",
      "EXPIRE rate:spell:bean 60",
    ],
    explanation: [
      "Increment the counter on each action.",
      "Attach a TTL so the window resets automatically.",
      "Read the count when you need to decide allow versus deny.",
    ],
  },
  {
    id: "leaderboard_shard",
    title: "Leaderboard Shard Merge",
    difficulty: "hard",
    summary: "Pick the order that updates one regional leaderboard and then reads the top players.",
    scenario: [
      "You keep one sorted set per region.",
      "A win should increase the score before the next read.",
      "The product wants the current top 3 immediately.",
    ],
    expectedCommandOrder: [
      "ZINCRBY ladder:kr 25 bean",
      "ZREVRANGE ladder:kr 0 2 WITHSCORES",
    ],
    commandBank: [
      "ZREVRANGE ladder:kr 0 2 WITHSCORES",
      "ZINCRBY ladder:kr 25 bean",
      "SMEMBERS ladder:kr",
    ],
    explanation: [
      "The score mutation has to happen before the read if the user expects a live rank update.",
      "A sorted set query returns ranking directly; `SMEMBERS` is the wrong structure and loses score ordering.",
    ],
  },
  {
    id: "event_replay",
    title: "Replayable Event Feed",
    difficulty: "hard",
    summary: "Choose the sequence that appends two durable events and then reads them back.",
    scenario: [
      "Your game service emits match lifecycle events.",
      "Another service may come online later and still needs the history.",
    ],
    expectedCommandOrder: [
      "XADD stream:matches * type created id m-1",
      "XADD stream:matches * type started id m-1",
      "XRANGE stream:matches - +",
    ],
    commandBank: [
      "PUBLISH stream:matches started",
      "XADD stream:matches * type created id m-1",
      "XRANGE stream:matches - +",
      "XADD stream:matches * type started id m-1",
    ],
    explanation: [
      "The `XADD` operations make the events durable and ordered.",
      "Reading with `XRANGE` is only meaningful because the data stayed in Redis after emission.",
      "Pub/Sub would drop the event for late consumers.",
    ],
  },
];
