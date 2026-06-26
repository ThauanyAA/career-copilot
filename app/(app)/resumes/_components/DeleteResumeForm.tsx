"use client";

import type { FormEvent } from "react";
import { deleteResume } from "../actions";
import { FormSubmitButton } from "@/components/FormSubmitButton";

const DELETE_RESUME_CONFIRMATION =
  "Delete this resume?\n\nThis removes the saved resume. Related resume insights may no longer be accessible.";

export function DeleteResumeForm({ resumeId }: { resumeId: string }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(DELETE_RESUME_CONFIRMATION)) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteResume} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={resumeId} />
      <FormSubmitButton
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
        pendingLabel="Deleting..."
      >
        Delete
      </FormSubmitButton>
    </form>
  );
}
