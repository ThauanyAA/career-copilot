import { FormSubmitButton } from "@/components/FormSubmitButton";
import type { Resume, ResumeFormAction } from "./types";

export function ResumeForm({
  action,
  resume,
  submitLabel,
}: {
  action: ResumeFormAction;
  resume?: Resume;
  submitLabel: string;
}) {
  const fieldIdPrefix = resume?.id ?? "new";

  return (
    <form action={action} className="mt-5">
      {resume && <input type="hidden" name="id" value={resume.id} />}
      <div className="space-y-5">
        <ResumeInput
          fieldId={`${fieldIdPrefix}-title`}
          label="Title"
          name="title"
          defaultValue={resume?.title}
          placeholder="Frontend resume - May 2026"
        />
        <ResumeTextarea
          fieldId={`${fieldIdPrefix}-content`}
          label="Resume text"
          name="content"
          defaultValue={resume?.content}
          placeholder="Paste the text version of your resume."
          rows={resume ? 10 : 14}
        />
        {!resume && (
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="is_primary"
              className="h-4 w-4 rounded border-zinc-300 text-blue-600"
            />
            Set as primary resume
          </label>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <FormSubmitButton
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          pendingLabel={resume ? "Updating..." : "Saving..."}
        >
          {submitLabel}
        </FormSubmitButton>
      </div>
    </form>
  );
}

function ResumeInput({
  defaultValue,
  fieldId,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string | null;
  fieldId: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type="text"
        required
        maxLength={120}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}

function ResumeTextarea({
  defaultValue,
  fieldId,
  label,
  name,
  placeholder,
  rows,
}: {
  defaultValue?: string | null;
  fieldId: string;
  label: string;
  name: string;
  placeholder?: string;
  rows: number;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        required
        maxLength={60000}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}
