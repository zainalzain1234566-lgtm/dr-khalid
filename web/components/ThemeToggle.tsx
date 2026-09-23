"use client";

/** Switches the homepage between the default theme and Theme B (coral). Persists per browser. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const el = document.documentElement;
    const next = el.dataset.theme === "coral" ? "" : "coral";
    if (next) el.dataset.theme = next;
    else delete el.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      title="Switch theme"
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-ink-700 ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
      </svg>
    </button>
  );
}
