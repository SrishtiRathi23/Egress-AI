import type { EgressNetwork, ZoneGateLink } from "@/lib/egress";

/** Deterministic PRNG (mulberry32) so property tests are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a random but well-formed egress network for property testing. */
export function randomNetwork(rng: () => number, id = "rand"): EgressNetwork {
  const zoneCount = 2 + Math.floor(rng() * 5); // 2..6
  const gateCount = 2 + Math.floor(rng() * 4); // 2..5

  const gates = Array.from({ length: gateCount }, (_, i) => ({
    id: `g${i}`,
    name: `Gate ${i}`,
    lanes: 2 + Math.floor(rng() * 12),
    serviceRatePerLane: 30 + Math.floor(rng() * 30),
    widthMetres: 6 + rng() * 10,
    depthMetres: 5 + rng() * 6,
  }));

  const zones = Array.from({ length: zoneCount }, (_, i) => ({
    id: `z${i}`,
    name: `Zone ${i}`,
    occupancy: Math.floor(500 + rng() * 8000),
  }));

  const links: ZoneGateLink[] = [];
  for (const zone of zones) {
    const shuffled = [...gates].sort(() => rng() - 0.5);
    const linkCount = 1 + Math.floor(rng() * gateCount);
    for (const gate of shuffled.slice(0, linkCount)) {
      links.push({
        zoneId: zone.id,
        gateId: gate.id,
        walkMinutes: 1 + rng() * 8,
      });
    }
  }

  return { id, name: id, zones, gates, links };
}
