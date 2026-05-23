import {
  RelevantReusableAnswerSchema,
  type RelevantReusableAnswer,
  type ReusableAnswerCategory,
} from "@/types/applicationPrep";
import type { Database } from "@/types/database";

type ReusableAnswerRow =
  Database["public"]["Tables"]["reusable_answers"]["Row"];

const categoryKeywords = {
  salary_expectation: ["salary", "compensation", "pay", "rate"],
  notice_period: ["notice", "start date", "available", "availability"],
  work_authorization: [
    "authorization",
    "authorisation",
    "visa",
    "sponsorship",
    "work permit",
  ],
  relocation: ["relocation", "relocate", "location", "remote", "hybrid"],
  availability: ["availability", "available", "start", "schedule"],
  motivation: ["motivation", "why", "interest", "company", "role"],
  experience_summary: ["experience", "background", "summary", "career"],
  custom: [],
} satisfies Record<ReusableAnswerCategory, string[]>;

const stopWords = new Set([
  "and",
  "are",
  "for",
  "the",
  "this",
  "that",
  "with",
  "you",
  "your",
]);

function compactText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3 && !stopWords.has(token))
  );
}

function countKeywordMatches(text: string, keywords: string[]) {
  const normalizedText = text.toLowerCase();

  return keywords.filter((keyword) =>
    normalizedText.includes(keyword.toLowerCase())
  ).length;
}

function countTokenOverlap(answer: ReusableAnswerRow, contextTokens: Set<string>) {
  const answerTokens = tokenize(
    `${answer.label} ${answer.question} ${answer.answer}`
  );

  return [...answerTokens].filter((token) => contextTokens.has(token)).length;
}

function getRelevanceReason({
  categoryMatches,
  tokenOverlap,
}: {
  categoryMatches: number;
  tokenOverlap: number;
}) {
  if (categoryMatches > 0 && tokenOverlap > 0) {
    return "Matched category keywords and application text.";
  }

  if (categoryMatches > 0) {
    return "Matched category keywords in the application text.";
  }

  return "Matched wording in the reusable answer and application text.";
}

export function selectRelevantReusableAnswers({
  answers,
  jobDescription,
  resumeContent,
}: {
  answers: ReusableAnswerRow[];
  jobDescription: string;
  resumeContent: string;
}): RelevantReusableAnswer[] {
  const contextText = `${jobDescription} ${resumeContent}`;
  const contextTokens = tokenize(contextText);

  const scoredAnswers = answers
    .map((answer, index) => {
      const categoryMatches = countKeywordMatches(
        contextText,
        categoryKeywords[answer.category]
      );
      const tokenOverlap = countTokenOverlap(answer, contextTokens);
      const score = categoryMatches * 3 + Math.min(tokenOverlap, 5);

      return {
        answer,
        categoryMatches,
        index,
        score,
        tokenOverlap,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    })
    .slice(0, 8);

  return scoredAnswers.map(({ answer, categoryMatches, tokenOverlap }) =>
    RelevantReusableAnswerSchema.parse({
      id: answer.id,
      label: compactText(answer.label, 120),
      category: answer.category,
      question: compactText(answer.question, 500),
      answer: compactText(answer.answer, 2000),
      relevanceReason: getRelevanceReason({ categoryMatches, tokenOverlap }),
    })
  );
}
