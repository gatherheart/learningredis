import type { InterviewQuestion } from "@/types";

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "junior_primitive_choice",
    level: "junior",
    topic: "data modeling",
    title: "Choose the right primitive",
    prompt: [
      "A teammate wants to store a leaderboard in a set because all player names are unique.",
      "What is the best correction?",
    ],
    options: [
      "Use a sorted set because rankings depend on scores, not just uniqueness.",
      "Use a list because order is always enough.",
      "Use a hash because hashes sort by numeric field automatically.",
    ],
    answer: 0,
    explanation:
      "A solid Redis answer starts from the access pattern. If ranking by score matters, `zset` is the correct primitive.",
  },
  {
    id: "junior_ttl_reasoning",
    level: "junior",
    topic: "expiration",
    title: "Why TTL is operationally useful",
    prompt: [
      "Why is attaching a TTL to a session key often better than storing the expiration only in application memory?",
    ],
    options: [
      "Because Redis can enforce expiry even if the application instance dies or forgets cleanup.",
      "Because TTL turns strings into hashes.",
      "Because session keys never consume RAM after a TTL is set.",
    ],
    answer: 0,
    explanation:
      "The benefit is ownership of lifecycle at the datastore level, not a type conversion or free memory guarantee.",
  },
  {
    id: "mid_cache_aside",
    level: "mid",
    topic: "caching",
    title: "Cache-aside tradeoff",
    prompt: [
      "In cache-aside, the application reads the primary store on a miss and then writes Redis.",
      "What weakness still exists?",
    ],
    options: [
      "Staleness and invalidation complexity remain application concerns.",
      "Redis refuses to store the cached result.",
      "The primary store can no longer be written to.",
    ],
    answer: 0,
    explanation:
      "Cache-aside is common because it is simple, but invalidation and consistency are still design work.",
  },
  {
    id: "mid_pipeline_vs_transaction",
    level: "mid",
    topic: "performance",
    title: "Pipeline versus transaction",
    prompt: [
      "A candidate says pipelining and `MULTI/EXEC` are interchangeable because both send many commands together.",
      "What is the correction?",
    ],
    options: [
      "Pipelining reduces round trips, while transactions change execution semantics by queueing a grouped commit.",
      "Transactions are only for reads, pipelines are only for writes.",
      "Pipelines automatically guarantee rollback.",
    ],
    answer: 0,
    explanation:
      "The network optimization and the atomic grouping are different concerns. Strong answers separate them immediately.",
  },
  {
    id: "senior_cluster_slotting",
    level: "senior",
    topic: "clustering",
    title: "Cross-slot design",
    prompt: [
      "A multi-key operation fails in Redis Cluster because the keys land in different slots.",
      "What does that tell you first?",
    ],
    options: [
      "The key naming strategy is part of the system design, not a cosmetic detail.",
      "Redis Cluster cannot store more than one key.",
      "The fix is always to disable clustering.",
    ],
    answer: 0,
    explanation:
      "At scale, key schema is architecture. Hash tags and access patterns must be designed deliberately when multi-key behavior matters.",
  },
  {
    id: "senior_failure_mode",
    level: "senior",
    topic: "operations",
    title: "Ask about failure before speed",
    prompt: [
      "A team says Redis solved latency, so the design review is done.",
      "What senior-level question should come next?",
    ],
    options: [
      "What happens during failover, memory pressure, stale reads, and cache loss?",
      "Which font does `redis-cli` use?",
      "Can Redis be rewritten in CSS?",
    ],
    answer: 0,
    explanation:
      "Senior Redis discussions are rarely about command syntax. They are about behavior under failure, load, and topology changes.",
  },
];
