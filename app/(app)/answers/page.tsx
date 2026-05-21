import { redirect } from "next/navigation";
import {
  createReusableAnswer,
  deleteReusableAnswer,
  updateReusableAnswer,
} from "./actions";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AnswerCategory = Database["public"]["Enums"]["reusable_answer_category"];
type ReusableAnswer = Database["public"]["Tables"]["reusable_answers"]["Row"];

type AnswersPageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    error?: string;
    updated?: string;
  }>;
};

const categoryOptions: { value: AnswerCategory; label: string }[] = [
  { value: "salary_expectation", label: "Salary expectation" },
  { value: "notice_period", label: "Notice period" },
  { value: "work_authorization", label: "Work authorization" },
  { value: "relocation", label: "Relocation" },
  { value: "availability", label: "Availability" },
  { value: "motivation", label: "Motivation" },
  { value: "experience_summary", label: "Experience summary" },
  { value: "custom", label: "Custom" },
];

const categoryLabels = new Map(
  categoryOptions.map((category) => [category.value, category.label])
);

export default async function AnswersPage({ searchParams }: AnswersPageProps) {
  const supabase = await createClient();
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !claimsData?.claims) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const { data: answers, error } = await supabase
    .from("reusable_answers")
    .select("*")
    .eq("user_id", userId)
    .order("category", { ascending: true })
    .order("updated_at", { ascending: false });

  let reusableAnswers = answers ?? [];
  let loadError: string | null = null;

  if (error) {
    console.error("Reusable answers load error:", {
      code: error.code,
      message: error.message,
    });
    reusableAnswers = [];
    loadError = "Unable to load your saved answers right now.";
  }

  const params = await searchParams;
  const statusMessage = getStatusMessage(params);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
            Reusable Answers
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Save answers for common application questions so future application
            assistance can reuse your preferred wording.
          </p>
        </div>

        {statusMessage && (
          <p className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            {statusMessage}
          </p>
        )}

        {params.error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {params.error}
          </p>
        )}

        {loadError && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {loadError}
          </p>
        )}

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Add an answer
          </h2>
          <ReusableAnswerForm
            action={createReusableAnswer}
            submitLabel="Save answer"
          />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Saved answers
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {loadError
                  ? "Unable to load saved answers"
                  : `${reusableAnswers.length} saved`}
              </p>
            </div>
          </div>

          {loadError ? null : reusableAnswers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              No reusable answers yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reusableAnswers.map((answer) => (
                <article
                  key={answer.id}
                  className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                        {answer.label}
                      </h3>
                      <p className="mt-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                        {categoryLabels.get(answer.category)}
                      </p>
                    </div>
                    <form action={deleteReusableAnswer}>
                      <input type="hidden" name="id" value={answer.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </form>
                  </div>

                  <ReusableAnswerForm
                    action={updateReusableAnswer}
                    answer={answer}
                    submitLabel="Update answer"
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getStatusMessage(params: Awaited<AnswersPageProps["searchParams"]>) {
  if (params.created) {
    return "Answer saved.";
  }

  if (params.updated) {
    return "Answer updated.";
  }

  if (params.deleted) {
    return "Answer deleted.";
  }

  return null;
}

function ReusableAnswerForm({
  action,
  answer,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  answer?: ReusableAnswer;
  submitLabel: string;
}) {
  const fieldIdPrefix = answer?.id ?? "new";

  return (
    <form action={action} className="mt-5">
      {answer && <input type="hidden" name="id" value={answer.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <AnswerInput
          fieldId={`${fieldIdPrefix}-label`}
          label="Label"
          name="label"
          defaultValue={answer?.label}
          placeholder="Visa sponsorship"
        />
        <AnswerSelect
          fieldId={`${fieldIdPrefix}-category`}
          defaultValue={answer?.category ?? "custom"}
        />
        <div className="sm:col-span-2">
          <AnswerTextarea
            fieldId={`${fieldIdPrefix}-question`}
            label="Question"
            name="question"
            defaultValue={answer?.question}
            placeholder="Will you now or in the future require sponsorship?"
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <AnswerTextarea
            fieldId={`${fieldIdPrefix}-answer`}
            label="Answer"
            name="answer"
            defaultValue={answer?.answer}
            placeholder="Write the answer you want to reuse."
            rows={6}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function AnswerInput({
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

function AnswerSelect({
  defaultValue,
  fieldId,
}: {
  defaultValue: AnswerCategory;
  fieldId: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        Category
      </label>
      <select
        id={fieldId}
        name="category"
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      >
        {categoryOptions.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AnswerTextarea({
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
        maxLength={name === "answer" ? 5000 : 500}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}
