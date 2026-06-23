import type { ReactNode } from "react";

export function PreviewBlock({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <h5 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {title}
      </h5>
      {children}
    </div>
  );
}

export function EmptyPreviewText({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
  );
}

export function PreviewReason({ reason }: { reason: string }) {
  return (
    <p className="mt-1 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      {reason}
    </p>
  );
}

export function PreviewEvidenceType({ evidenceType }: { evidenceType: string }) {
  return (
    <p className="mt-1 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      Evidence: {formatFieldName(evidenceType)}
    </p>
  );
}

export function SourceSnippet({ snippet }: { snippet: string | null }) {
  if (!snippet) {
    return null;
  }

  return (
    <p className="mt-2 break-words text-xs italic leading-relaxed text-zinc-500 dark:text-zinc-400">
      Source: {snippet}
    </p>
  );
}

export function formatFieldName(field: string) {
  return field.replaceAll("_", " ");
}

export function formatSuggestedValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(", ") : value;
}
