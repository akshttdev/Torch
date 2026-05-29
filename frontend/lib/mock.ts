// Mock data layer. Replace with `/eval/latest`, `/sources`, etc. once backend lands.

export type SourceKind = "docs" | "code" | "issues" | "forum" | "so";

export type SourceRow = {
  kind: SourceKind;
  name: string;
  count: number;
  bytes: number;
  last_synced_at: number; // epoch seconds
  status: "healthy" | "stale" | "failed";
  embedder: string;
  chunker: { size: number; overlap: number; strategy: string };
  sampleChunks: { title: string; url: string; snippet: string }[];
  // 12-bucket histogram of chunk lengths in tokens
  histogram: number[];
};

const NOW = 1748246400; // 2026-05-26 — keeps "X ago" stable across renders

export const sources: SourceRow[] = [
  {
    kind: "docs",
    name: "pytorch.org/docs/stable",
    count: 8214,
    bytes: 41_300_000,
    last_synced_at: NOW - 60 * 60 * 2, // 2h ago
    status: "healthy",
    embedder: "BAAI/bge-base-en-v1.5",
    chunker: { size: 512, overlap: 64, strategy: "section-aware" },
    sampleChunks: [
      {
        title: "torch.utils.data — Multi-process data loading",
        url: "https://pytorch.org/docs/stable/data.html#multi-process-data-loading",
        snippet:
          "When num_workers > 0, each worker process is spawned via the start method configured on the platform. On macOS the default became 'spawn' in Python 3.8…",
      },
      {
        title: "torch.compile — Dynamic shapes",
        url: "https://pytorch.org/docs/stable/torch.compiler_dynamic_shapes.html",
        snippet:
          "Passing dynamic=True instructs TorchDynamo to specialize dimensions only when necessary, allowing graphs to be reused across varying batch sizes…",
      },
      {
        title: "Automatic differentiation — retain_graph",
        url: "https://pytorch.org/docs/stable/autograd.html#torch.autograd.backward",
        snippet:
          "If retain_graph is True, the graph used to compute the grad will not be freed. In most cases, setting retain_graph=True is not necessary and can be worked around…",
      },
      {
        title: "torch.nn.Linear",
        url: "https://pytorch.org/docs/stable/generated/torch.nn.Linear.html",
        snippet:
          "Applies an affine transformation y = xA^T + b. Weights are initialized from U(-√k, √k) where k = 1 / in_features…",
      },
      {
        title: "MPS backend",
        url: "https://pytorch.org/docs/stable/notes/mps.html",
        snippet:
          "The MPS backend extends the PyTorch framework, providing scripts and capabilities to set up and run operations on Mac…",
      },
    ],
    histogram: [12, 48, 96, 184, 312, 482, 691, 824, 612, 421, 248, 96],
  },
  {
    kind: "code",
    name: "pytorch/pytorch (torch.*)",
    count: 12480,
    bytes: 28_900_000,
    last_synced_at: NOW - 60 * 60 * 6, // 6h ago
    status: "healthy",
    embedder: "jinaai/jina-embeddings-v2-base-code",
    chunker: { size: 0, overlap: 0, strategy: "AST function/class" },
    sampleChunks: [
      {
        title: "torch/utils/data/dataloader.py — _MultiProcessingDataLoaderIter",
        url: "https://github.com/pytorch/pytorch/blob/main/torch/utils/data/dataloader.py#L1041",
        snippet:
          "class _MultiProcessingDataLoaderIter(_BaseDataLoaderIter):\n    def __init__(self, loader):\n        super().__init__(loader)\n        # …",
      },
      {
        title: "torch/nn/modules/linear.py — Linear",
        url: "https://github.com/pytorch/pytorch/blob/main/torch/nn/modules/linear.py#L91",
        snippet:
          "class Linear(Module):\n    def reset_parameters(self) -> None:\n        init.kaiming_uniform_(self.weight, a=math.sqrt(5))\n        # …",
      },
      {
        title: "torch/_dynamo/variables/builder.py — _dynamic_shapes_specializer",
        url: "https://github.com/pytorch/pytorch/blob/main/torch/_dynamo/variables/builder.py#L612",
        snippet:
          "def _dynamic_shapes_specializer(value, source):\n    if not torch._dynamo.config.dynamic_shapes:\n        return None\n    # …",
      },
    ],
    histogram: [2, 18, 64, 142, 318, 564, 982, 1240, 1118, 798, 412, 184],
  },
  {
    kind: "issues",
    name: "pytorch/pytorch — Issues + PRs",
    count: 5126,
    bytes: 19_400_000,
    last_synced_at: NOW - 60 * 24, // 24m ago
    status: "healthy",
    embedder: "BAAI/bge-base-en-v1.5",
    chunker: { size: 4096, overlap: 0, strategy: "title+body, top-5 comments" },
    sampleChunks: [
      {
        title: "#111873 — DataLoader workers hang on macOS with multiprocessing",
        url: "https://github.com/pytorch/pytorch/issues/111873",
        snippet:
          "I'm hitting a reproducible hang when num_workers=4 on M-series macs. fork is no longer the default in Python 3.8+, so spawn is used…",
      },
      {
        title: "#118732 — torch.compile recompiles on every batch size",
        url: "https://github.com/pytorch/pytorch/issues/118732",
        snippet:
          "Reproducer below. Even with dynamic=True I see Dynamo specializing dim 0 each time. The guards mention…",
      },
      {
        title: "#102634 — MPS backend NaN in autograd on conv2d",
        url: "https://github.com/pytorch/pytorch/issues/102634",
        snippet:
          "Running a fp16 conv2d forward+backward on MPS produces NaN gradients for kernels > 5x5. CPU and CUDA paths are stable…",
      },
    ],
    histogram: [42, 184, 312, 482, 612, 698, 612, 432, 248, 142, 84, 38],
  },
  {
    kind: "forum",
    name: "discuss.pytorch.org",
    count: 0,
    bytes: 0,
    last_synced_at: NOW - 86400 * 14, // 14d ago, never ingested
    status: "stale",
    embedder: "BAAI/bge-base-en-v1.5",
    chunker: { size: 512, overlap: 64, strategy: "Q + accepted + top 3" },
    sampleChunks: [],
    histogram: [],
  },
];

// 6 metric cards on /eval (Torch + Vanilla side)
export type Metric = {
  key: string;
  label: string;
  value: number;
  vanilla: number | null;
  // 10-point history for sparkline
  history: number[];
  fmt: "pct" | "ratio" | "ms";
  better: "up" | "down";
};

export const metrics: Metric[] = [
  {
    key: "hit1",
    label: "Hit@1",
    value: 0.71,
    vanilla: null,
    history: [0.58, 0.6, 0.62, 0.61, 0.64, 0.65, 0.68, 0.69, 0.7, 0.71],
    fmt: "ratio",
    better: "up",
  },
  {
    key: "hit5",
    label: "Hit@5",
    value: 0.87,
    vanilla: null,
    history: [0.73, 0.75, 0.78, 0.79, 0.81, 0.82, 0.84, 0.85, 0.86, 0.87],
    fmt: "ratio",
    better: "up",
  },
  {
    key: "mrr",
    label: "MRR",
    value: 0.61,
    vanilla: null,
    history: [0.48, 0.51, 0.52, 0.54, 0.55, 0.57, 0.58, 0.59, 0.6, 0.61],
    fmt: "ratio",
    better: "up",
  },
  {
    key: "recall10",
    label: "Recall@10",
    value: 0.93,
    vanilla: null,
    history: [0.81, 0.83, 0.85, 0.86, 0.87, 0.89, 0.9, 0.91, 0.92, 0.93],
    fmt: "ratio",
    better: "up",
  },
  {
    key: "cit_prec",
    label: "Citation precision",
    value: 0.83,
    vanilla: 0.0,
    history: [0.71, 0.73, 0.74, 0.76, 0.77, 0.79, 0.8, 0.81, 0.82, 0.83],
    fmt: "ratio",
    better: "up",
  },
  {
    key: "faith",
    label: "Faithfulness",
    value: 0.81,
    vanilla: 0.42,
    history: [0.68, 0.7, 0.72, 0.74, 0.75, 0.76, 0.78, 0.79, 0.8, 0.81],
    fmt: "ratio",
    better: "up",
  },
];

// 50-point latency series (in ms)
export const latency = {
  p50: [612, 598, 624, 631, 605, 590, 612, 599, 617, 622, 608, 595, 612, 624, 631, 612, 598, 605, 619, 631, 612, 624, 631, 605, 590, 612, 599, 617, 622, 608, 595, 612, 624, 631, 612, 598, 605, 619, 631, 612, 624, 605, 590, 612, 599, 617, 622, 608, 595, 620],
  p95: [1080, 1124, 1098, 1156, 1102, 1088, 1112, 1098, 1142, 1118, 1098, 1075, 1112, 1156, 1098, 1080, 1124, 1142, 1102, 1088, 1112, 1098, 1156, 1102, 1088, 1112, 1098, 1142, 1118, 1098, 1075, 1112, 1156, 1098, 1080, 1124, 1142, 1102, 1156, 1098, 1080, 1102, 1088, 1112, 1098, 1142, 1118, 1098, 1075, 1110],
  p99: [1820, 1942, 1880, 1962, 1898, 1842, 1902, 1880, 1942, 1920, 1880, 1822, 1902, 1962, 1880, 1820, 1942, 1942, 1898, 1842, 1902, 1880, 1962, 1898, 1842, 1902, 1880, 1942, 1920, 1880, 1822, 1902, 1962, 1880, 1820, 1942, 1942, 1898, 1962, 1880, 1820, 1898, 1842, 1902, 1880, 1942, 1920, 1880, 1822, 1900],
};

export const perSourceHit5 = [
  { kind: "docs" as SourceKind, value: 0.89 },
  { kind: "code" as SourceKind, value: 0.84 },
  { kind: "issues" as SourceKind, value: 0.91 },
];

export const failureModes = [
  { id: "tb-0142", q: "How does FSDP shard buffers vs parameters?", score: 0.21, category: "distributed" },
  { id: "tb-0089", q: "Why does torch.compile inline a guard on item()?", score: 0.24, category: "compile" },
  { id: "tb-0211", q: "Custom autograd Function backward returns None for unused inputs", score: 0.28, category: "autograd" },
  { id: "tb-0167", q: "NCCL hangs when world_size mismatches between hosts", score: 0.31, category: "distributed" },
  { id: "tb-0102", q: "MPS NaN gradients on conv2d with kernel > 5", score: 0.33, category: "mps" },
  { id: "tb-0078", q: "Where is the C++ dispatch for aten::_foreach_add?", score: 0.34, category: "internals" },
  { id: "tb-0188", q: "Why is set_to_none=True the new default in zero_grad?", score: 0.36, category: "optim" },
  { id: "tb-0044", q: "Difference between torch.no_grad and inference_mode", score: 0.38, category: "autograd" },
];

// Landing demo: a real question with a streamed answer + 3 citations
export const demo = {
  query: "Why does my DataLoader hang with num_workers>0 on macOS?",
  answer: [
    "On macOS, Python's default multiprocessing start method became spawn in 3.8",
    "[1]. That means each DataLoader worker re-imports your module — if the",
    " script isn't guarded by `if __name__ == \"__main__\"`, the workers will",
    " loop spawning workers and hang.\n\n",
    "The fix has two parts. Wrap the entrypoint",
    " [2], and pin `num_workers=0` for notebook-style execution where reimport",
    " is unreliable [3].",
  ],
  citations: [
    {
      n: 1,
      kind: "docs" as SourceKind,
      title: "Multi-process data loading — start methods",
      url: "https://pytorch.org/docs/stable/data.html#multi-process-data-loading",
      score: 0.91,
      snippet:
        "Python 3.8 changed the default start method on macOS from 'fork' to 'spawn' for safety. PyTorch DataLoader inherits this behavior…",
    },
    {
      n: 2,
      kind: "code" as SourceKind,
      title: "torch/utils/data/dataloader.py — _BaseDataLoaderIter L1100",
      url: "https://github.com/pytorch/pytorch/blob/main/torch/utils/data/dataloader.py#L1100",
      score: 0.86,
      snippet:
        "When num_workers > 0 the iter delegates to _MultiProcessingDataLoaderIter, which boots worker processes via the platform's start method…",
    },
    {
      n: 3,
      kind: "issues" as SourceKind,
      title: "#111873 — DataLoader workers hang on macOS",
      url: "https://github.com/pytorch/pytorch/issues/111873",
      score: 0.79,
      snippet:
        "Confirmed repro on M2 + Python 3.11. Workaround: wrap entrypoint or set num_workers=0 in interactive sessions…",
    },
  ],
};

export const bento = [
  {
    title: "Hybrid retrieval",
    body: "BM25 + dense vectors fused with Reciprocal Rank Fusion across docs, code, and issues.",
    stat: "hit@5 = 0.87",
  },
  {
    title: "Code-aware chunking",
    body: "AST function- and class-level chunks. No char-windows splitting methods in half.",
    stat: "12,480 symbols indexed",
  },
  {
    title: "Inline citations",
    body: "Every factual claim carries a numbered chip that opens the exact line on GitHub.",
    stat: "cit-prec 0.83",
  },
  {
    title: "Live eval dashboard",
    body: "250-Q benchmark runs in CI. Hit@k, MRR, faithfulness — all reported on every commit.",
    stat: "250 Q · nightly",
  },
  {
    title: "Source-aware filter",
    body: "Constrain retrieval to docs, code, or issues. Routing weights are exposed, not hidden.",
    stat: "4 corpora",
  },
  {
    title: "Streaming SSE",
    body: "Tokens stream while citations resolve in the sidebar. First token under 1.2s p95.",
    stat: "p95 1.10s",
  },
];

export const corpus = {
  totalChunks: sources.reduce((a, s) => a + s.count, 0),
  totalBytes: sources.reduce((a, s) => a + s.bytes, 0),
  fresh: sources
    .filter((s) => s.count > 0)
    .sort((a, b) => b.last_synced_at - a.last_synced_at)[0],
  oldest: sources
    .filter((s) => s.count > 0)
    .sort((a, b) => a.last_synced_at - b.last_synced_at)[0],
};

export const evalRunMeta = {
  ts: "2026-05-26 03:11 UTC",
  suite: "full",
  n: 250,
  model: "Claude Sonnet 4.6",
  gpu: "none (CPU rerank)",
  build: "f3c1a02",
};
