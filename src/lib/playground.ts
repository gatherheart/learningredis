export interface PlaygroundExecuteResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

interface PlaygroundExecuteRequest {
  channel: "stable";
  mode: "debug";
  edition: "2021";
  crateType: "bin";
  tests: false;
  code: string;
}

const PLAYGROUND_EXECUTE_URL = "https://play.rust-lang.org/execute";

export function playgroundUrl(code: string): string {
  const params = new URLSearchParams({
    version: "stable",
    mode: "debug",
    edition: "2021",
    code,
  });
  return `https://play.rust-lang.org/?${params.toString()}`;
}

export async function executeRust(code: string, signal?: AbortSignal): Promise<PlaygroundExecuteResult> {
  const payload: PlaygroundExecuteRequest = {
    channel: "stable",
    mode: "debug",
    edition: "2021",
    crateType: "bin",
    tests: false,
    code,
  };

  const response = await fetch(PLAYGROUND_EXECUTE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Rust execution failed with status ${response.status}`);
  }

  return response.json() as Promise<PlaygroundExecuteResult>;
}
