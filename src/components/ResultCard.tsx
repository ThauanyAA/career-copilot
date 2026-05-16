interface ResultCardProps {
  title: string;
  content: string | string[];
  variant?: "score" | "list" | "text";
}

function sanitizeListItems(items: string[]): string[] {
  return items
    .filter((item): item is string => {
      // Keep only non-empty strings after trimming
      return typeof item === "string" && item.trim().length > 0;
    })
    .map((item) => item.trim())
    .filter((item) => {
      // Filter out common malformed patterns
      // Exclude items that are just punctuation or special characters
      return /[a-zA-Z0-9]/.test(item);
    });
}

export function ResultCard({
  title,
  content,
  variant = "text",
}: ResultCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      {variant === "score" && (
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {content}%
        </p>
      )}
      {variant === "list" && (
        <ul className="space-y-2">
          {Array.isArray(content) &&
            sanitizeListItems(content).map((item, idx) => (
              <li
                key={idx}
                className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span>{item}</span>
              </li>
            ))}
        </ul>
      )}
      {variant === "text" && (
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {content}
        </p>
      )}
    </div>
  );
}
