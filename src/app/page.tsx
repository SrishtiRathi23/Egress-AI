import { Console } from "@/components/Console";
import { SAMPLE_NETWORKS, VENUE_META } from "@/data/venues";
import { buildPlan } from "@/lib/plan-service";

// The home page loads a default deterministic plan with no incident, so it is
// completely safe to prerender at build time for maximum efficiency (SSG).

// The first paint is server-rendered from the deterministic engine -- no client
// fetch on load, which keeps data-fetching out of effects entirely.
export default async function HomePage() {
  const defaultId = SAMPLE_NETWORKS[0]?.id ?? "arlington";
  const initialPlan = await buildPlan(defaultId);
  const venues = SAMPLE_NETWORKS.map((network) => {
    const meta = VENUE_META[network.id];
    return {
      id: network.id,
      name: network.name,
      city: meta?.city ?? "",
      capacity: meta?.capacity ?? 0,
    };
  });

  if (initialPlan === null) {
    return (
      <main className="app-shell">
        <p>Unable to load venue data.</p>
      </main>
    );
  }

  return <Console initialPlan={initialPlan} initialNetworkId={defaultId} venues={venues} />;
}
