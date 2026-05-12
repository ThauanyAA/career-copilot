export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Career Copilot
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            AI-powered job application assistant
          </p>
        </div>
      </div>
    </header>
  );
}
