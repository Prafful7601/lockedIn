// Health goals — define goals and log daily values. Mirrors onto the dashboard.

import { getHealthOverview } from "@/lib/data";
import HealthTracker from "@/components/HealthTracker";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const goals = await getHealthOverview(7);
  const hitToday = goals.filter((g) => g.todayValue >= g.target).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="label">Health</p>
          <h1 className="mt-1 text-2xl font-semibold">Daily goals</h1>
        </div>
        <div className="text-right">
          <p className="stat">{hitToday}/{goals.length}</p>
          <p className="label">goals hit today</p>
        </div>
      </div>

      <p className="text-xs text-muted">
        Use −/+ or type a value to log today · bars show the last 7 days (green = target met).
      </p>

      <HealthTracker goals={goals} />
    </div>
  );
}
