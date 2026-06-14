// Build-in-public — draft a LinkedIn progress post from your week's data.

import PostGenerator from "@/components/PostGenerator";

export const dynamic = "force-dynamic";

export default function BuildInPublicPage() {
  const apiKeyConfigured = !!process.env.GEMINI_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Build in public</p>
        <h1 className="mt-1 text-2xl font-semibold">Weekly progress post</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Turn this week&apos;s grind — coding hours, problems solved on the A2Z sheet, and your
          streaks — into a LinkedIn-style post. Generate, tweak the wording, then copy.
        </p>
      </div>

      <PostGenerator apiKeyConfigured={apiKeyConfigured} />
    </div>
  );
}
