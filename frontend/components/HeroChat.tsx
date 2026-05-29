// Compact dark chat preview rendered inside the hero.
// Renders an assistant bubble + input row with send + voice icons.

export function HeroChat() {
  return (
    <div className="relative w-full max-w-[280px] rounded-md border border-white/20 bg-white/[0.08] p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150">
      {/* top icon row */}
      <div className="mb-2 flex items-center justify-end gap-2 text-zinc-400">
        <button
          type="button"
          aria-label="Attach"
          className="rounded-md p-1.5 hover:bg-white/[0.06] hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10.5 5.5L5 11a2 2 0 0 0 2.83 2.83l5.5-5.5a3.5 3.5 0 1 0-4.95-4.95L2.88 8.81"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Link"
          className="rounded-md p-1.5 hover:bg-white/[0.06] hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6.5 5h-2a3 3 0 0 0 0 6h2m3 0h2a3 3 0 0 0 0-6h-2M5.5 8h5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="More"
          className="rounded-md p-1.5 hover:bg-white/[0.06] hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3.5" r="1" />
            <circle cx="8" cy="8" r="1" />
            <circle cx="8" cy="12.5" r="1" />
          </svg>
        </button>
      </div>

      {/* assistant bubble */}
      <div className="mb-2 max-w-[82%] rounded-md bg-white/[0.06] px-2.5 py-1.5 text-left text-[10.5px] leading-snug text-zinc-200">
        DataLoader hangs on macOS because Python 3.8 changed the default start
        method from <span className="mono text-torch-300">fork</span> to{" "}
        <span className="mono text-torch-300">spawn</span>{" "}
        <span className="mono text-torch-400">[1]</span>.
      </div>

      {/* input row */}
      <div className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1">
        <input
          readOnly
          placeholder="Ask…"
          defaultValue="Why does num_workers hang?"
          className="min-w-0 flex-1 truncate bg-transparent text-[10.5px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
        />
        <button
          type="button"
          aria-label="Send"
          className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 8l12-5-5 12-2-5-5-2z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Voice"
          className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-white"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M4 8a4 4 0 0 0 8 0M8 12v2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
