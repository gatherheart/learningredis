import type { RedisKeyState, RedisStreamEntry } from "@/types";

export interface SimulationSnapshot {
  step: number;
  command: string;
  outputs: string[];
  state: RedisKeyState[];
  changedKeys: string[];
  queued?: string[];
}

export interface SimulationResult {
  snapshots: SimulationSnapshot[];
  finalOutput: string;
}

interface SimulationState {
  keys: RedisKeyState[];
  streamCounter: number;
  multiQueue: string[];
  inMulti: boolean;
}

function cloneState(keys: RedisKeyState[]) {
  return keys.map((key) => ({
    ...key,
    hashValue: key.hashValue ? { ...key.hashValue } : undefined,
    listValue: key.listValue ? [...key.listValue] : undefined,
    setValue: key.setValue ? [...key.setValue] : undefined,
    zsetValue: key.zsetValue ? key.zsetValue.map((item) => ({ ...item })) : undefined,
    streamValue: key.streamValue ? key.streamValue.map((entry) => ({ id: entry.id, fields: { ...entry.fields } })) : undefined,
    streamGroups: key.streamGroups ? key.streamGroups.map((group) => ({ ...group, pending: [...group.pending] })) : undefined,
  }));
}

function tokenize(line: string) {
  const tokens: string[] = [];
  const regex = /"([^"]*)"|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    tokens.push(match[1] ?? match[2]);
  }
  return tokens;
}

function findKey(state: SimulationState, key: string) {
  return state.keys.find((entry) => entry.key === key);
}

function getOrCreateKey(state: SimulationState, key: string, type: RedisKeyState["type"]) {
  let current = findKey(state, key);
  if (!current) {
    current = { key, type };
    state.keys.push(current);
  }
  current.type = type;
  return current;
}

function normalizeSet(values: string[]) {
  return [...new Set(values)].sort();
}

function formatArray(values: string[]) {
  if (values.length === 0) return "(empty array)";
  return values.map((value, index) => `${index + 1}) "${value}"`).join("\n");
}

function formatZRange(values: Array<{ member: string; score: number }>) {
  if (values.length === 0) return "(empty array)";
  const lines: string[] = [];
  values.forEach((item, index) => {
    lines.push(`${index * 2 + 1}) "${item.member}"`);
    lines.push(`${index * 2 + 2}) "${String(item.score)}"`);
  });
  return lines.join("\n");
}

function formatStream(entries: RedisStreamEntry[]) {
  if (entries.length === 0) return "(empty array)";
  return entries
    .map((entry, index) => {
      const pairs = Object.entries(entry.fields)
        .map(([field, value]) => `${field}=${value}`)
        .join(", ");
      return `${index + 1}) ${entry.id} {${pairs}}`;
    })
    .join("\n");
}

function capture(
  simulation: SimulationState,
  snapshots: SimulationSnapshot[],
  command: string,
  outputs: string[],
  changedKeys: string[],
) {
  snapshots.push({
    step: snapshots.length + 1,
    command,
    outputs,
    state: cloneState(simulation.keys),
    changedKeys,
    queued: simulation.inMulti ? [...simulation.multiQueue] : undefined,
  });
}

function runImmediateCommand(simulation: SimulationState, command: string) {
  const tokens = tokenize(command);
  const op = tokens[0]?.toUpperCase();
  const changedKeys: string[] = [];

  if (!op) return { outputs: [], changedKeys };

  switch (op) {
    case "SET": {
      const key = tokens[1];
      const value = tokens[2] ?? "";
      const nx = tokens.includes("NX");
      const exIndex = tokens.findIndex((token) => token.toUpperCase() === "EX");
      const pxIndex = tokens.findIndex((token) => token.toUpperCase() === "PX");
      const ttl =
        exIndex !== -1 ? Number(tokens[exIndex + 1]) : pxIndex !== -1 ? Math.ceil(Number(tokens[pxIndex + 1]) / 1000) : null;
      if (nx && findKey(simulation, key)) {
        return { outputs: ["(nil)"], changedKeys };
      }
      const entry = getOrCreateKey(simulation, key, "string");
      entry.stringValue = value;
      entry.ttl = Number.isFinite(ttl) ? ttl : null;
      changedKeys.push(key);
      return { outputs: ["OK"], changedKeys };
    }
    case "GET": {
      const entry = findKey(simulation, tokens[1]);
      return { outputs: [entry?.stringValue ? `"${entry.stringValue}"` : "(nil)"], changedKeys };
    }
    case "INCR":
    case "DECR": {
      const key = tokens[1];
      const entry = getOrCreateKey(simulation, key, "string");
      const current = Number(entry.stringValue ?? "0");
      const next = op === "INCR" ? current + 1 : current - 1;
      entry.stringValue = String(next);
      changedKeys.push(key);
      return { outputs: [`(integer) ${next}`], changedKeys };
    }
    case "HSET": {
      const key = tokens[1];
      const entry = getOrCreateKey(simulation, key, "hash");
      entry.hashValue ??= {};
      let added = 0;
      for (let index = 2; index < tokens.length; index += 2) {
        const field = tokens[index];
        const value = tokens[index + 1] ?? "";
        if (!(field in entry.hashValue)) added += 1;
        entry.hashValue[field] = value;
      }
      changedKeys.push(key);
      return { outputs: [`(integer) ${added}`], changedKeys };
    }
    case "HINCRBY": {
      const key = tokens[1];
      const field = tokens[2];
      const delta = Number(tokens[3] ?? "0");
      const entry = getOrCreateKey(simulation, key, "hash");
      entry.hashValue ??= {};
      const current = Number(entry.hashValue[field] ?? "0");
      const next = current + delta;
      entry.hashValue[field] = String(next);
      changedKeys.push(key);
      return { outputs: [`(integer) ${next}`], changedKeys };
    }
    case "HGET": {
      const entry = findKey(simulation, tokens[1]);
      const value = entry?.hashValue?.[tokens[2]];
      return { outputs: [value ? `"${value}"` : "(nil)"], changedKeys };
    }
    case "RPUSH":
    case "LPUSH": {
      const key = tokens[1];
      const entry = getOrCreateKey(simulation, key, "list");
      entry.listValue ??= [];
      const values = tokens.slice(2);
      if (op === "RPUSH") entry.listValue.push(...values);
      else entry.listValue.unshift(...values.reverse());
      changedKeys.push(key);
      return { outputs: [`(integer) ${entry.listValue.length}`], changedKeys };
    }
    case "LPOP":
    case "RPOP": {
      const entry = findKey(simulation, tokens[1]);
      const value = op === "LPOP" ? entry?.listValue?.shift() : entry?.listValue?.pop();
      if (entry) changedKeys.push(entry.key);
      return { outputs: [value ? `"${value}"` : "(nil)"], changedKeys };
    }
    case "LRANGE": {
      const entry = findKey(simulation, tokens[1]);
      const values = entry?.listValue ?? [];
      return { outputs: [formatArray(values)], changedKeys };
    }
    case "SADD": {
      const key = tokens[1];
      const entry = getOrCreateKey(simulation, key, "set");
      entry.setValue ??= [];
      const before = new Set(entry.setValue);
      tokens.slice(2).forEach((member) => before.add(member));
      const after = normalizeSet([...before]);
      const added = after.length - entry.setValue.length;
      entry.setValue = after;
      changedKeys.push(key);
      return { outputs: [`(integer) ${added}`], changedKeys };
    }
    case "SREM": {
      const entry = findKey(simulation, tokens[1]);
      const before = new Set(entry?.setValue ?? []);
      let removed = 0;
      tokens.slice(2).forEach((member) => {
        if (before.delete(member)) removed += 1;
      });
      if (entry) {
        entry.setValue = normalizeSet([...before]);
        changedKeys.push(entry.key);
      }
      return { outputs: [`(integer) ${removed}`], changedKeys };
    }
    case "SISMEMBER": {
      const entry = findKey(simulation, tokens[1]);
      const ok = entry?.setValue?.includes(tokens[2]) ? 1 : 0;
      return { outputs: [`(integer) ${ok}`], changedKeys };
    }
    case "SMEMBERS": {
      const entry = findKey(simulation, tokens[1]);
      return { outputs: [formatArray(entry?.setValue ?? [])], changedKeys };
    }
    case "ZADD": {
      const key = tokens[1];
      const entry = getOrCreateKey(simulation, key, "zset");
      entry.zsetValue ??= [];
      let added = 0;
      for (let index = 2; index < tokens.length; index += 2) {
        const score = Number(tokens[index]);
        const member = tokens[index + 1];
        const current = entry.zsetValue.find((item) => item.member === member);
        if (current) current.score = score;
        else {
          entry.zsetValue.push({ member, score });
          added += 1;
        }
      }
      entry.zsetValue.sort((a, b) => b.score - a.score || a.member.localeCompare(b.member));
      changedKeys.push(key);
      return { outputs: [`(integer) ${added}`], changedKeys };
    }
    case "ZINCRBY": {
      const key = tokens[1];
      const delta = Number(tokens[2]);
      const member = tokens[3];
      const entry = getOrCreateKey(simulation, key, "zset");
      entry.zsetValue ??= [];
      let current = entry.zsetValue.find((item) => item.member === member);
      if (!current) {
        current = { member, score: 0 };
        entry.zsetValue.push(current);
      }
      current.score += delta;
      entry.zsetValue.sort((a, b) => b.score - a.score || a.member.localeCompare(b.member));
      changedKeys.push(key);
      return { outputs: [`"${String(current.score)}"`], changedKeys };
    }
    case "ZREVRANGE": {
      const entry = findKey(simulation, tokens[1]);
      const values = [...(entry?.zsetValue ?? [])];
      return { outputs: [formatZRange(values)], changedKeys };
    }
    case "EXPIRE": {
      const entry = findKey(simulation, tokens[1]);
      if (!entry) return { outputs: ["(integer) 0"], changedKeys };
      entry.ttl = Number(tokens[2] ?? "0");
      changedKeys.push(entry.key);
      return { outputs: ["(integer) 1"], changedKeys };
    }
    case "TTL": {
      const entry = findKey(simulation, tokens[1]);
      if (!entry) return { outputs: ["(integer) -2"], changedKeys };
      if (entry.ttl == null) return { outputs: ["(integer) -1"], changedKeys };
      return { outputs: [`(integer) ${entry.ttl}`], changedKeys };
    }
    case "DEL": {
      const key = tokens[1];
      const before = simulation.keys.length;
      simulation.keys = simulation.keys.filter((entry) => entry.key !== key);
      return { outputs: [`(integer) ${before === simulation.keys.length ? 0 : 1}`], changedKeys: [key] };
    }
    case "XADD": {
      const key = tokens[1];
      const entry = getOrCreateKey(simulation, key, "stream");
      entry.streamValue ??= [];
      simulation.streamCounter += 1;
      const id = `${simulation.streamCounter}-0`;
      const fields: Record<string, string> = {};
      for (let index = 3; index < tokens.length; index += 2) {
        fields[tokens[index]] = tokens[index + 1] ?? "";
      }
      entry.streamValue.push({ id, fields });
      changedKeys.push(key);
      return { outputs: [`"${id}"`], changedKeys };
    }
    case "XRANGE": {
      const entry = findKey(simulation, tokens[1]);
      return { outputs: [formatStream(entry?.streamValue ?? [])], changedKeys };
    }
    case "WATCH":
      return { outputs: ["OK"], changedKeys };
    default:
      return { outputs: [`(error) Unsupported command: ${op}`], changedKeys };
  }
}

export function simulateRedis(commands: string, initialState: RedisKeyState[]): SimulationResult {
  const simulation: SimulationState = {
    keys: cloneState(initialState),
    streamCounter: 0,
    multiQueue: [],
    inMulti: false,
  };
  const snapshots: SimulationSnapshot[] = [];
  const lines = commands
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line) => {
    const op = tokenize(line)[0]?.toUpperCase();
    if (!op) return;

    if (op === "MULTI") {
      simulation.inMulti = true;
      simulation.multiQueue = [];
      capture(simulation, snapshots, line, ["OK"], []);
      return;
    }

    if (op === "EXEC") {
      const execOutputs: string[] = [];
      const changedKeys = new Set<string>();
      simulation.multiQueue.forEach((queued) => {
        const result = runImmediateCommand(simulation, queued);
        execOutputs.push(...result.outputs);
        result.changedKeys.forEach((key) => changedKeys.add(key));
      });
      simulation.inMulti = false;
      simulation.multiQueue = [];
      capture(simulation, snapshots, line, execOutputs.map((output, index) => `${index + 1}) ${output}`), [...changedKeys]);
      return;
    }

    if (simulation.inMulti) {
      simulation.multiQueue.push(line);
      capture(simulation, snapshots, line, ["QUEUED"], []);
      return;
    }

    const result = runImmediateCommand(simulation, line);
    capture(simulation, snapshots, line, result.outputs, result.changedKeys);
  });

  return {
    snapshots,
    finalOutput: snapshots.flatMap((snapshot) => snapshot.outputs).join("\n"),
  };
}
