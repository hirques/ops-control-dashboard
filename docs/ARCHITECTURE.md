# Architecture and boundaries

## Scope

Ops Control Dashboard is a client-side demo, not a real monitoring platform. It shows a potential UX for operational observability while making its limitations explicit.

## Data flow

1. `demo-data.ts` provides immutable reference fixtures for services, incidents and time series.
2. `domain.ts` computes service health from incidents (`critical` => `down`; other unresolved => `degraded`).
3. `App.tsx` manages the active view, filters, selected incident and local state.
4. `store.ts` validates persisted JSON before restoring only recognized incident identifiers/states.
5. The browser stores the local incident changes with `localStorage` and exports JSON on user demand.

## Security and privacy

- No server-side environment variables or credentials are required.
- The app never fetches telemetry or sends user data to external APIs.
- Insecure or malformed localStorage entries cannot inject arbitrary HTML; React escapes content by default.
- Export is a local browser download.
- Demo incident transitions must not be confused with real operational acknowledgements.

## Testing

Unit tests cover incident prioritization, status computation, filtering, recovery of malformed stored state and incident transitions. The CI workflow checks these tests, TypeScript and the Vite production build.

## Extension points

A genuine production integration would require an authenticated API, service-side authorization, source freshness timestamps, real monitoring backends, incident audit trails, and encrypted secrets handling. None of these are part of the portfolio demo.
