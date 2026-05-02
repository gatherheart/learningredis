import type { Lesson } from "@/types";

export const lessons: Lesson[] = [
  {
    id: "01_strings_counters",
    topic: "Strings and counters",
    difficulty: "starter",
    title: "Boot the arcade economy",
    description:
      "Redis strings are the base primitive for counters, feature flags, and cached values.\n\n```redis\nSET coins:bean 41\nINCR coins:bean\nGET coins:bean\n```\n\nFor many game systems, a string key is enough. `INCR` is atomic, so you do not need a read-modify-write round trip for a simple score counter.",
    objectives: [
      "Read and write simple values.",
      "Use atomic counters instead of fetching and rewriting manually.",
      "Notice that Redis replies are part of the mental model, not just the data.",
    ],
    commands: `SET coins:bean 41
INCR coins:bean
GET coins:bean`,
    expectedOutput: `OK
(integer) 42
"42"`,
    visualFocus: "A single key card should flash as the counter mutates.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "Type the exact Redis replies for this command sequence.",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Why is `INCR coins:bean` better than `GET` then `SET` for a score counter?",
        options: [
          "It is atomic and removes race conditions for simple increments.",
          "It stores the counter outside Redis memory.",
          "It makes the key immutable after the update.",
          "It changes the key type from string to integer.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "fill-in-blank",
        question: "Fill the missing command that bumps the same counter by one.",
        template: "SET coins:bean 9\n___ coins:bean",
        blanks: ["INCR"],
      },
    ],
  },
  {
    id: "02_hash_profiles",
    topic: "Hashes",
    difficulty: "starter",
    title: "Store a player profile",
    description:
      "Hashes let one Redis key hold many related fields.\n\n```redis\nHSET player:7 name bean rank bronze mmr 1200\nHINCRBY player:7 mmr 32\nHGET player:7 mmr\n```\n\nThis is a common pattern for session metadata, user profiles, and compact mutable objects.",
    objectives: [
      "Group related fields under one key.",
      "Update one field without rewriting the rest.",
      "Recognize why hashes are cleaner than dozens of sibling keys for one entity.",
    ],
    commands: `HSET player:7 name bean rank bronze mmr 1200
HINCRBY player:7 mmr 32
HGET player:7 mmr`,
    expectedOutput: `(integer) 3
(integer) 1232
"1232"`,
    visualFocus: "Field badges should update inline to show object-like mutation.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "What replies does Redis return here?",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Why use a hash for `player:7` instead of keys like `player:7:name` and `player:7:mmr`?",
        options: [
          "Hashes keep one entity grouped and let you update individual fields cleanly.",
          "Hashes can only be read by one client at a time.",
          "Hashes force every field to be numeric.",
          "Hashes automatically expire when a field changes.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "spot-the-bug",
        question: "Which line is wrong if you want to increase the numeric `mmr` field?",
        code: `HSET player:7 name bean rank bronze mmr 1200
HGET player:7 mmr
HSET player:7 mmr bronze
HINCRBY player:7 mmr 32`,
        buggyLine: 3,
      },
    ],
  },
  {
    id: "03_lists_matchmaking",
    topic: "Lists",
    difficulty: "starter",
    title: "Build a matchmaking queue",
    description:
      "Lists are a natural fit for queue-like mechanics.\n\n```redis\nRPUSH queue:ranked bean moon river\nLPOP queue:ranked\nLRANGE queue:ranked 0 -1\n```\n\nAppending on one side and consuming from the other gives you FIFO behavior for simple job or player queues.",
    objectives: [
      "Understand how push and pop direction changes queue behavior.",
      "Read remaining queue state after one player is matched.",
      "Map list operations to game server workflows.",
    ],
    commands: `RPUSH queue:ranked bean moon river
LPOP queue:ranked
LRANGE queue:ranked 0 -1`,
    expectedOutput: `(integer) 3
"bean"
1) "moon"
2) "river"`,
    visualFocus: "Tokens should slide out of the queue from the left when popped.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "Write the exact replies for the queue flow.",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "What behavior does `RPUSH` plus `LPOP` model?",
        options: [
          "FIFO queue",
          "LIFO stack",
          "Sorted leaderboard",
          "Set membership",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "order-statements",
        question: "Order the commands for: enqueue two players, match the oldest, inspect the queue.",
        options: [
          "LPOP queue:ranked",
          "LRANGE queue:ranked 0 -1",
          "RPUSH queue:ranked bean moon",
        ],
        answer: [2, 0, 1],
      },
    ],
  },
  {
    id: "04_sets_uniqueness",
    topic: "Sets",
    difficulty: "intermediate",
    title: "Guard unique guild membership",
    description:
      "Sets answer presence and uniqueness questions well.\n\n```redis\nSADD guild:red bean bean moon\nSISMEMBER guild:red moon\nSMEMBERS guild:red\n```\n\nIf duplicate inserts must collapse automatically, a set is usually the right primitive.",
    objectives: [
      "Recognize when uniqueness matters more than order.",
      "Use membership checks without scanning a list.",
      "Understand why duplicate inserts return smaller counts.",
    ],
    commands: `SADD guild:red bean bean moon
SISMEMBER guild:red moon
SMEMBERS guild:red`,
    expectedOutput: `(integer) 2
(integer) 1
1) "bean"
2) "moon"`,
    visualFocus: "New members should burst into the set bubble only once.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "What does Redis return when duplicates are added to a set?",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Why is a set better than a list for online guild membership?",
        options: [
          "You care about uniqueness and cheap membership checks more than insertion order.",
          "Lists cannot hold strings.",
          "Sets automatically sort by score.",
          "Lists cannot remove members.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "fill-in-blank",
        question: "Fill the command that checks whether `moon` belongs to the guild set.",
        template: "SADD guild:red bean moon\n___ guild:red moon",
        blanks: ["SISMEMBER"],
      },
    ],
  },
  {
    id: "05_zsets_leaderboard",
    topic: "Sorted sets",
    difficulty: "intermediate",
    title: "Run a live leaderboard",
    description:
      "Sorted sets combine uniqueness with ordering by score.\n\n```redis\nZADD ladder 1200 bean 1180 moon 1255 river\nZINCRBY ladder 40 moon\nZREVRANGE ladder 0 2 WITHSCORES\n```\n\nThis is one of the signature Redis use cases because ranking is built into the data structure.",
    objectives: [
      "Model a leaderboard directly with a zset.",
      "Change one player score and re-rank instantly.",
      "Read back the top players with scores.",
    ],
    commands: `ZADD ladder 1200 bean 1180 moon 1255 river
ZINCRBY ladder 40 moon
ZREVRANGE ladder 0 2 WITHSCORES`,
    expectedOutput: `(integer) 3
"1220"
1) "river"
2) "1255"
3) "moon"
4) "1220"
5) "bean"
6) "1200"`,
    visualFocus: "Leaderboard rows should reorder after the score update.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "Type the exact replies for the leaderboard session.",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Why is a sorted set stronger than a plain set for rankings?",
        options: [
          "Each member keeps a score, so order can be queried without sorting in application code.",
          "Plain sets cannot contain usernames.",
          "Sorted sets replicate faster by default.",
          "Sorted sets are required for expiration.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "spot-the-bug",
        question: "Which line breaks the idea of a score-based leaderboard?",
        code: `ZADD ladder 1200 bean 1180 moon 1255 river
SADD ladder moon
ZINCRBY ladder 40 moon
ZREVRANGE ladder 0 2 WITHSCORES`,
        buggyLine: 2,
      },
    ],
  },
  {
    id: "06_ttl_sessions",
    topic: "Expiration and caching",
    difficulty: "intermediate",
    title: "Expire a session automatically",
    description:
      "Expiration is where Redis becomes operationally interesting.\n\n```redis\nSET session:bean active EX 90\nTTL session:bean\nEXPIRE session:bean 20\nTTL session:bean\n```\n\nShort-lived state such as sessions, cooldowns, and cache entries often becomes much simpler when the datastore owns the timeout.",
    objectives: [
      "Attach a TTL as part of the write path.",
      "Inspect remaining time-to-live.",
      "Understand how cache invalidation can be delegated to Redis.",
    ],
    commands: `SET session:bean active EX 90
TTL session:bean
EXPIRE session:bean 20
TTL session:bean`,
    expectedOutput: `OK
(integer) 90
(integer) 1
(integer) 20`,
    visualFocus: "The key should show a countdown badge that changes after `EXPIRE`.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "Write the replies for the TTL flow.",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Why is Redis expiration useful for game sessions or cache entries?",
        options: [
          "The datastore can remove stale state without a separate cleanup worker for every case.",
          "It turns every key into a sorted set.",
          "It prevents replication.",
          "It guarantees permanent storage on disk.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "fill-in-blank",
        question: "Fill the command that rewrites the TTL to 20 seconds.",
        template: "SET session:bean active EX 90\n___ session:bean 20",
        blanks: ["EXPIRE"],
      },
    ],
  },
  {
    id: "07_transactions",
    topic: "Transactions",
    difficulty: "professional",
    title: "Queue atomic shop updates",
    description:
      "Redis transactions are not SQL transactions, but they still matter.\n\n```redis\nSET item:42 2\nMULTI\nDECR item:42\nGET item:42\nEXEC\n```\n\n`MULTI` queues commands and `EXEC` runs them together in order. This is useful when a feature needs atomic grouping, but you still need to understand what Redis does and does not guarantee.",
    objectives: [
      "See the difference between immediate replies and queued replies.",
      "Understand the `MULTI`/`EXEC` command flow.",
      "Avoid assuming Redis transactions are a full relational isolation model.",
    ],
    commands: `SET item:42 2
MULTI
DECR item:42
GET item:42
EXEC`,
    expectedOutput: `OK
OK
QUEUED
QUEUED
1) (integer) 1
2) "1"`,
    visualFocus: "A queued command rail should light up before commit, then apply together on EXEC.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "What does Redis print before and after `EXEC`?",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "What is the key point of `MULTI` here?",
        options: [
          "Commands are queued first, then executed together when `EXEC` runs.",
          "Every command becomes rollback-safe like a SQL database.",
          "Each command is replicated to a different Redis instance automatically.",
          "The key type changes to a transaction object.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "order-statements",
        question: "Order the transaction lifecycle correctly.",
        options: [
          "Queue `DECR item:42`",
          "Run `EXEC`",
          "Start with `MULTI`",
          "Queue `GET item:42`",
        ],
        answer: [2, 0, 3, 1],
      },
    ],
  },
  {
    id: "08_streams",
    topic: "Streams",
    difficulty: "professional",
    title: "Track asynchronous match events",
    description:
      "Streams are a stronger fit than Pub/Sub when you need replayable event logs.\n\n```redis\nXADD stream:matches * player bean mode duo\nXADD stream:matches * player moon mode squad\nXRANGE stream:matches - +\n```\n\nThis is the step from toy caching into event-driven system design. Now the commands themselves describe a durable event feed, not just a mutable key.",
    objectives: [
      "Append immutable events to a stream.",
      "Read the full event history in order.",
      "Understand why streams differ from ephemeral fan-out patterns.",
    ],
    commands: `XADD stream:matches * player bean mode duo
XADD stream:matches * player moon mode squad
XRANGE stream:matches - +`,
    expectedOutput: `"1-0"
"2-0"
1) 1-0 {player=bean, mode=duo}
2) 2-0 {player=moon, mode=squad}`,
    visualFocus: "Event cards should stack vertically with generated IDs.",
    initialState: [],
    quizzes: [
      {
        id: "q1",
        type: "predict-output",
        question: "Type the exact replies for the stream append and read.",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "Why choose a stream over Pub/Sub for replayable match events?",
        options: [
          "Streams retain ordered entries that can be read later instead of disappearing after publish.",
          "Pub/Sub supports scores while streams do not.",
          "Streams are the only Redis structure that can store strings.",
          "Pub/Sub requires transactions for every message.",
        ],
        answer: 0,
      },
      {
        id: "q3",
        type: "spot-the-bug",
        question: "Which line turns the durable event log into the wrong primitive?",
        code: `XADD stream:matches * player bean mode duo
PUBLISH stream:matches "bean joined"
XADD stream:matches * player moon mode squad
XRANGE stream:matches - +`,
        buggyLine: 2,
      },
    ],
  },
];
