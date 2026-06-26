import assert from "node:assert/strict";
import test from "node:test";
import {
  ResumeProfileSuggestionsResultSchema,
  sanitizeProfileSuggestions,
} from "./resumeIntelligence";

function makeProfileSuggestion(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    confidence: "high",
    currentValue: null,
    evidenceType: "reasonable_inference",
    field: "headline",
    reason: "The resume summary supports this profile update.",
    sourceLabel: "Resume summary",
    sourceSnippet: null,
    suggestedValue: "Frontend Engineer",
    ...overrides,
  };
}

test("drops salary_expectation when evidenceType is reasonable_inference", () => {
  const result = sanitizeProfileSuggestions([
    makeProfileSuggestion({
      evidenceType: "reasonable_inference",
      field: "salary_expectation",
      sourceSnippet: "Expected compensation: $120k.",
      suggestedValue: "$120k",
    }),
  ]);

  assert.equal(result.droppedCount, 1);
  assert.deepEqual(result.profileSuggestions, []);
});

test("drops salary_expectation when sourceSnippet is null", () => {
  const result = sanitizeProfileSuggestions([
    makeProfileSuggestion({
      evidenceType: "explicit_resume_text",
      field: "salary_expectation",
      sourceSnippet: null,
      suggestedValue: "$120k",
    }),
  ]);

  assert.equal(result.droppedCount, 1);
  assert.deepEqual(result.profileSuggestions, []);
});

test("keeps salary_expectation with explicit resume text and source snippet", () => {
  const result = sanitizeProfileSuggestions([
    makeProfileSuggestion({
      evidenceType: "explicit_resume_text",
      field: "salary_expectation",
      sourceSnippet: "Expected compensation: $120k.",
      suggestedValue: "$120k",
    }),
  ]);

  assert.equal(result.droppedCount, 0);
  assert.equal(result.profileSuggestions.length, 1);
  assert.equal(result.profileSuggestions[0]?.field, "salary_expectation");
});

test("keeps valid non-sensitive suggestions", () => {
  const result = sanitizeProfileSuggestions([
    makeProfileSuggestion({
      field: "skills",
      suggestedValue: ["React", "TypeScript"],
    }),
    makeProfileSuggestion({
      field: "target_roles",
      suggestedValue: ["Frontend Engineer"],
    }),
    makeProfileSuggestion({
      field: "headline",
      suggestedValue: "Senior Frontend Engineer",
    }),
  ]);

  assert.equal(result.droppedCount, 0);
  assert.deepEqual(
    result.profileSuggestions.map((suggestion) => suggestion.field),
    ["skills", "target_roles", "headline"]
  );
});

test("drops suggestions that fail ResumeProfileSuggestionSchema", () => {
  const result = sanitizeProfileSuggestions([
    makeProfileSuggestion({
      field: "unsupported_field",
    }),
    makeProfileSuggestion({
      suggestedValue: "",
    }),
  ]);

  assert.equal(result.droppedCount, 2);
  assert.deepEqual(result.profileSuggestions, []);
});

test("sanitized suggestions validate with ResumeProfileSuggestionsResultSchema", () => {
  const result = sanitizeProfileSuggestions([
    makeProfileSuggestion({
      field: "headline",
      suggestedValue: "Senior Frontend Engineer",
    }),
    makeProfileSuggestion({
      evidenceType: "reasonable_inference",
      field: "salary_expectation",
      sourceSnippet: "Expected compensation: $120k.",
      suggestedValue: "$120k",
    }),
  ]);

  const parsed = ResumeProfileSuggestionsResultSchema.safeParse({
    profileSuggestions: result.profileSuggestions,
  });

  assert.equal(result.droppedCount, 1);
  assert.equal(parsed.success, true);
});
