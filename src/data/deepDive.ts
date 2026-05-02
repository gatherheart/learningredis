import type { DeepDiveQuestion } from "@/types";

export const deepDiveQuestions: DeepDiveQuestion[] = [
  {
    id: "cache_vs_source_of_truth",
    topic: "caching",
    title: "Cache or source of truth?",
    scenario: [
      "A team wants to store player inventory only in Redis because reads are fast.",
      "The same data must survive region outages and accidental flushes.",
    ],
    question: "What is the strongest engineering objection?",
    options: [
      "Redis is fast, so it should replace every primary datastore.",
      "Fast access does not remove durability and recovery requirements for core business data.",
      "Redis cannot store JSON-like objects.",
      "Redis keys cannot exceed one region.",
    ],
    answer: 1,
    explanation:
      "The hard question is not raw speed. It is whether Redis is being used as a cache, a coordination layer, or a durable system of record, and whether that choice is justified operationally.",
  },
  {
    id: "eviction_policy",
    topic: "memory",
    title: "Eviction policy tradeoff",
    scenario: [
      "You run a cache-heavy workload and Redis memory is capped.",
      "Some keys are cold, some are extremely hot.",
    ],
    question: "What matters most when choosing an eviction policy?",
    options: [
      "Whether the policy matches the workload's hot-key behavior and failure tolerance.",
      "Whether the policy alphabetically sorts keys before removing them.",
      "Whether the policy disables TTL support.",
      "Whether the policy stores data on the CPU instead of RAM.",
    ],
    answer: 0,
    explanation:
      "Eviction is a workload decision. You need to decide what should disappear first when memory pressure rises, not just pick a default and hope it matches production behavior.",
  },
  {
    id: "replication_lag",
    topic: "replication",
    title: "Replica read risk",
    scenario: [
      "Writes go to the primary.",
      "Low-latency reads go to replicas.",
      "The product team assumes every read is immediately current.",
    ],
    question: "Why is that assumption weak?",
    options: [
      "Replica reads can be stale if replication lag exists.",
      "Replicas cannot answer reads at all.",
      "Replication converts strings into hashes.",
      "Reads from replicas are automatically transactional.",
    ],
    answer: 0,
    explanation:
      "Redis replication is asynchronous by default. Replica reads are a latency tradeoff, not a free strong-consistency upgrade.",
  },
  {
    id: "lua_vs_roundtrips",
    topic: "scripting",
    title: "When scripting helps",
    scenario: [
      "A feature requires checking a cooldown key, updating a counter, and writing a result atomically.",
      "The naive implementation performs three network round trips.",
    ],
    question: "Why might a Lua script be a better fit?",
    options: [
      "It can run the logic atomically on the server and reduce coordination round trips.",
      "Lua scripts automatically shard keys across clusters.",
      "Lua scripts persist after Redis restarts without deployment.",
      "Lua scripts replace every data structure with streams.",
    ],
    answer: 0,
    explanation:
      "Server-side scripts are valuable when logic must see and mutate state as one atomic server operation, especially if client-side coordination would be fragile.",
  },
  {
    id: "streams_vs_pubsub",
    topic: "streams",
    title: "Ephemeral versus replayable messaging",
    scenario: [
      "One consumer is offline for 10 minutes.",
      "The team still expects it to process every match event from the outage window.",
    ],
    question: "Which observation is strongest?",
    options: [
      "Pub/Sub is enough because messages wait forever for offline consumers.",
      "Streams are a better fit because entries remain readable after they are produced.",
      "Lists automatically fan out one message to many services.",
      "Sorted sets are the normal event log structure.",
    ],
    answer: 1,
    explanation:
      "This is the classic dividing line: Pub/Sub is fan-out delivery now, streams are retained ordered history with consumer coordination options.",
  },
  {
    id: "distributed_lock_limits",
    topic: "coordination",
    title: "Limits of distributed locks",
    scenario: [
      "A team uses `SET lock:key token NX PX 5000` and assumes every failure mode is solved.",
      "The protected job sometimes runs longer than expected.",
    ],
    question: "What is the real risk to reason about?",
    options: [
      "Lock expiry, ownership validation, and process pauses can break naive assumptions.",
      "The lock key cannot store strings.",
      "The `NX` option deletes the key immediately.",
      "Locks make network partitions impossible.",
    ],
    answer: 0,
    explanation:
      "Redis locks are useful, but they are not magic. Expiration timing, safe unlock patterns, and failure cases still require careful design.",
  },
];
