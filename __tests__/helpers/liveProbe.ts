/**
 * Reachability probes for the live integration suites.
 *
 * A probe returns `true` only when the host couldn't be reached — signalled by
 * the SDK's transport-failure statuses (`0` = no HTTP response, `408` = our
 * client-side timeout). Anything else (a 200, or even a 5xx) means the server
 * answered, so the suite should run and assert. Keying the skip on transport
 * status — never on assertions — means a real contract drift (host up, response
 * shape changed) still fails loudly instead of being masked as "down".
 *
 * Used with `describe.skipIf(...)` so an upstream outage yellows the run
 * (skipped) rather than reding it (failed).
 */
import { OrganizationService, FideService } from '../../src';

const PROBE_TIMEOUT_MS = 2500;

async function probe(host: string, call: Promise<{ status: number; error?: string }>): Promise<boolean> {
  const res = await call;
  const down = res.status === 0 || res.status === 408;
  // Announce only an outage (staying silent on the happy path keeps `pnpm test`
  // clean). Write straight to stderr — Vitest intercepts console.* during
  // collection and drops it for a fully-skipped file, so console.warn wouldn't
  // be seen. This line is the "why did it skip / is the host down" signal.
  if (down) {
    process.stderr.write(
      `[integration] ${host} unreachable (status ${res.status}: ${res.error}); skipping live suite.\n`
    );
  }
  return down;
}

/** True when member.schack.se (SSF) can't be reached. */
export function ssfUnreachable(): Promise<boolean> {
  return probe(
    'member.schack.se (SSF)',
    new OrganizationService(undefined, PROBE_TIMEOUT_MS).getFederation()
  );
}

/** True when api.chesstools.org (FIDE) can't be reached. */
export function fideUnreachable(): Promise<boolean> {
  return probe(
    'api.chesstools.org (FIDE)',
    new FideService(undefined, PROBE_TIMEOUT_MS).getTopByRating(1)
  );
}
