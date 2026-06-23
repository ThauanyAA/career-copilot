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

export function CollapsiblePreviewSection({
  children,
  count,
  title,
}: {
  children: ReactNode;
  count: number;
  title: string;
}) {
  return (
    <details className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <summary className="cursor-pointer list-inside text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <span>{title}</span>
        <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
          {count}
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function EmptyPreviewText({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
  );
}

export function SupportingDetails({
  children,
  label = "Details",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </summary>
      <div className="mt-2 space-y-1">{children}</div>
    </details>
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
