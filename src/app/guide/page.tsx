// How to use — a step-by-step guide to running and using LockedIn.

import Link from "next/link";

export const metadata = { title: "How to use · LockedIn" };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-accent font-mono text-sm text-accent">
        {n}
      </div>
      <div className="flex-1 pb-6">
        <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
        <div className="mt-1.5 space-y-2 text-sm text-muted">{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-ink-900 p-3 font-mono text-xs text-gray-200">
      {children}
    </pre>
  );
}

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="label">How to use</p>
        <h1 className="mt-1 text-2xl font-semibold">Getting started with LockedIn</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Everything from first run to going live, in order.
        </p>
      </div>

      {/* Setup */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
          1 · Run it locally
        </h2>
        <div className="panel p-6">
          <Step n={1} title="Install dependencies">
            <Code>npm install</Code>
          </Step>
          <Step n={2} title="Create + seed the database">
            <p>Builds the local SQLite file and fills it with example data.</p>
            <Code>{`npm run db:push\nnpm run db:seed`}</Code>
          </Step>
          <Step n={3} title="Add your free AI key (optional)">
            <p>
              Get a free Google Gemini key at{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent hover:underline">
                aistudio.google.com/apikey
              </a>{" "}
              (keys start with <span className="font-mono">AIza…</span> or{" "}
              <span className="font-mono">AQ.…</span> — both work). Put it in{" "}
              <span className="font-mono">.env</span>:
            </p>
            <Code>GEMINI_API_KEY=your-key-here</Code>
            <p>Without a key the app still runs — the AI Coach just shows an &ldquo;offline&rdquo; note.</p>
          </Step>
          <Step n={4} title="Start the app">
            <Code>npm run dev</Code>
            <p>
              Open <span className="font-mono">http://localhost:3000</span>.
            </p>
          </Step>
        </div>
      </section>

      {/* Daily use */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
          2 · Use it day to day
        </h2>
        <div className="panel space-y-4 p-6 text-sm text-muted">
          <p>
            <span className="font-semibold text-gray-100">Dashboard</span> — your daily briefing,
            streaks, time totals, and the 7-day heatmap. Hit{" "}
            <span className="font-mono text-accent">Plan my day</span> for an AI to-do list.
          </p>
          <p>
            <Link href="/dsa" className="font-semibold text-accent hover:underline">DSA</Link>{" "}
            — work the Striver A2Z sheet. <span className="font-mono">Generate today&apos;s task</span>,
            solve it, mark it done (it checks the problems off the sheet and grows your streak).
          </p>
          <p>
            <Link href="/tasks" className="font-semibold text-accent hover:underline">Tasks</Link>{" "}
            — add recurring habits (LinkedIn, job apps…). Check them daily; click past days to backfill.
          </p>
          <p>
            <Link href="/health" className="font-semibold text-accent hover:underline">Health</Link>{" "}
            — define water/sleep/workout goals and log them with the −/+ buttons.
          </p>
          <p>
            <Link href="/build-in-public" className="font-semibold text-accent hover:underline">Build in Public</Link>{" "}
            — generate a LinkedIn post from your week, edit it, copy it.
          </p>
        </div>
      </section>

      {/* Trackers */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
          3 · Track your time automatically
        </h2>
        <div className="panel p-6">
          <Step n={1} title="Download the trackers">
            <p>
              Grab them on the{" "}
              <Link href="/downloads" className="text-accent hover:underline">
                Downloads
              </Link>{" "}
              page — one for VS Code (coding time), one for the browser (YouTube time).
            </p>
          </Step>
          <Step n={2} title="Install the VS Code tracker">
            <p>Unzip it, open the folder in VS Code, press <span className="font-mono">F5</span>. Code for a minute → &ldquo;Coding today&rdquo; goes up.</p>
          </Step>
          <Step n={3} title="Install the YouTube tracker">
            <p>
              Unzip it, go to <span className="font-mono">chrome://extensions</span>, enable Developer
              mode, click <span className="font-mono">Load unpacked</span>, pick the folder. Play a
              video → &ldquo;YouTube today&rdquo; goes up.
            </p>
          </Step>
          <Step n={4} title="They run at the same time">
            <p>Coding while a video plays tracks both independently — that&apos;s the point.</p>
          </Step>
        </div>
      </section>

      {/* Deploy */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
          4 · Take it live (Vercel + Turso)
        </h2>
        <div className="panel space-y-3 p-6 text-sm text-muted">
          <p>
            SQLite files don&apos;t persist on Vercel, so production uses{" "}
            <span className="font-mono">Turso</span> (hosted SQLite). Local dev stays on your file —
            the app switches automatically when <span className="font-mono">TURSO_DATABASE_URL</span> is set.
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Create a free Turso DB and grab its URL + token.</li>
            <li>Push your code to GitHub and import the repo at vercel.com/new.</li>
            <li>
              In Vercel, set <span className="font-mono">GEMINI_API_KEY</span>,{" "}
              <span className="font-mono">TURSO_DATABASE_URL</span>,{" "}
              <span className="font-mono">TURSO_AUTH_TOKEN</span>. Deploy.
            </li>
            <li>Point the trackers&apos; endpoints at your new Vercel URL.</li>
          </ol>
          <p>
            Full commands are in the project <span className="font-mono">README.md</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
