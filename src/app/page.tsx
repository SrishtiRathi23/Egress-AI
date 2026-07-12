import { Console } from "@/components/Console";
import { SAMPLE_NETWORKS } from "@/data/venues";
import { buildPlan } from "@/lib/plan-service";

// Live, per-request data (and possibly a live Gemini narration), so this page is
// rendered on demand rather than prerendered at build time.
export const dynamic = "force-dynamic";

// The first paint is server-rendered from the deterministic engine -- no client
// fetch on load, which keeps data-fetching out of effects entirely.
export default async function HomePage() {
  const defaultId = SAMPLE_NETWORKS[0]?.id ?? "arlington";
  const initialPlan = await buildPlan(defaultId);
  const venues = SAMPLE_NETWORKS.map((network) => ({ id: network.id, name: network.name }));

  if (initialPlan === null) {
    return (
      <main className="app-shell">
        <p>Unable to load venue data.</p>
      </main>
    );
  }

  return <Console initialPlan={initialPlan} initialNetworkId={defaultId} venues={venues} />;
}
