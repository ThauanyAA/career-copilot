export function LoadingSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400"
        aria-hidden="true"
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Analyzing your match...
      </p>
    </div>
  );
}
