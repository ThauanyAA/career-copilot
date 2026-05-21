import { Header } from "@/components/Header";
import { JobMatchAnalyzer } from "@/components/JobMatchAnalyzer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <JobMatchAnalyzer />
        </div>
      </main>
    </div>
  );
}
