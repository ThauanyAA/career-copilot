import { createHash } from "crypto";

export function calculateResumeContentHash(resumeContent: string) {
  return createHash("sha256").update(resumeContent).digest("hex");
}
