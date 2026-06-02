// Frontend → FastAPI client.
//
// All requests go through `NEXT_PUBLIC_API_URL`. Default for local dev is
// `http://localhost:8000`. In Vercel production, set this in the project
// settings to whatever public host is fronting your backend (Cloudflare
// tunnel, Tailscale Funnel, ngrok, Fly.io app, your box on a static IP, …).
//
// SSE note: native EventSource only supports GET, but our /ask is POST
// (body has the query + filter). So we use `fetch` with a ReadableStream
// reader and parse the SSE wire format manually.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

// ─── shared types ───────────────────────────────────────────────────────

export type SourceRow = {
  name: string;
  kind: "docs" | "code" | "issues" | "forum" | "so";
  count: number;
  last_synced_at: number | null;
  bm25_loaded: boolean;
  status: "healthy" | "empty" | "stale" | "failed";
};

export type SearchHit = {
  id: string;
  score: number;
  rrf_score?: number;
  rerank_score?: number;
  collection?: string;
  payload: Record<string, unknown>;
};

export type SearchResponse = {
  query: string;
  n: number;
  results: SearchHit[];
  latency_ms: number;
};

export type Health = {
  ok: boolean;
  service: string;
  version: string;
  ts: string;
  qdrant: boolean;
  b2: boolean;
  bm25: Record<string, number>;
  qdrant_error?: string;
  b2_error?: string;
};

// ─── REST ───────────────────────────────────────────────────────────────

async function jsonOk<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}
    throw new Error(`${res.status} ${res.statusText} — ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function getHealth(): Promise<Health> {
  return jsonOk<Health>(await fetch(`${API_BASE}/healthz`, { cache: "no-store" }));
}

export async function getSources(): Promise<{ sources: SourceRow[] }> {
  return jsonOk(await fetch(`${API_BASE}/sources`, { cache: "no-store" }));
}

export async function searchSync(
  query: string,
  opts: { sources?: string[]; top_k?: number } = {}
): Promise<SearchResponse> {
  return jsonOk(
    await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, sources: opts.sources, top_k: opts.top_k ?? 8 }),
    })
  );
}

export async function postFeedback(args: {
  query_id: string;
  rating: -1 | 1;
  reason?: string;
  query?: string;
}): Promise<{ ok: true }> {
  return jsonOk(
    await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args),
    })
  );
}

// ─── SSE — POST /ask ────────────────────────────────────────────────────

export type AskEvent =
  | { type: "sources"; sources: AskSource[] }
  | { type: "token"; text: string }
  | { type: "citation"; id: number; source?: AskSource }
  | { type: "done"; latency_ms: number; n_tokens: number }
  | { type: "error"; message: string };

export type AskSource = {
  n: number;
  id: string;
  kind: string;
  title: string;
  url: string;
  score: number;
  snippet: string;
};

export type StreamHandle = { abort: () => void };

/**
 * Start a POST /ask stream. `onEvent` is called for every parsed SSE message.
 * The returned `abort()` cancels the underlying fetch.
 */
export function streamAsk(
  args: { query: string; sources?: string[]; top_k?: number },
  onEvent: (ev: AskEvent) => void,
  onError?: (e: Error) => void
): StreamHandle {
  const ctrl = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: args.query,
          sources: args.sources,
          top_k: args.top_k ?? 8,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`/ask failed: ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      // SSE wire format: events separated by blank lines, each line of an
      // event starts with `data: `. We collect all `data:` lines per event
      // and JSON.parse once we hit the blank-line separator.
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // process complete events
        let sepIdx: number;
        while ((sepIdx = buf.indexOf("\n\n")) !== -1) {
          const frame = buf.slice(0, sepIdx);
          buf = buf.slice(sepIdx + 2);

          const dataLines: string[] = [];
          for (const line of frame.split("\n")) {
            if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
            // (we ignore `event:`, `id:`, `retry:` — backend doesn't use them)
          }
          if (dataLines.length === 0) continue;
          const raw = dataLines.join("\n");
          try {
            const parsed = JSON.parse(raw) as AskEvent;
            onEvent(parsed);
          } catch {
            // skip malformed
          }
        }
      }
    } catch (e: unknown) {
      if ((e as { name?: string }).name === "AbortError") return;
      onError?.(e as Error);
    }
  })();

  return { abort: () => ctrl.abort() };
}
