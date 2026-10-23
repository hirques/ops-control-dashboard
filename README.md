# Ops Control Dashboard

**A responsive infrastructure operations dashboard built with React, TypeScript, Vite, and custom CSS.**

An interactive front-end portfolio project that demonstrates a monitoring-style overview, service inventory, incident triage, activity history, and JSON export. The design is optimized for desktop and mobile screens.

> [!IMPORTANT]
> **Demo-only application.** The names, timestamps, status indicators, service metrics, and incidents are fictional. No production environment, monitoring agent, or live API is connected. Incident actions are browser-local; the project does **not** claim real-time observability.

## Features

- **Overview:** health KPIs, 24h/7d/30d charts with toggleable series, a health distribution donut, and priority incident queue.
- **Services:** free-text search; filtering by operational, degraded, and critical states; per-service CPU, memory, latency, and uptime samples.
- **Incidents:** inspect a detailed modal, acknowledge an alert, and resolve it. Services update their calculated status immediately.
- **Activity log:** timeline of sample events and the user's local incident actions.
- **Settings:** transparent data-source disclosure and one-click demo reset.
- **Export:** download the currently displayed sample state as JSON.
- **Persistence:** session actions are saved in `localStorage` on this device. No cookies, API keys, or external telemetry.
- **Accessibility:** text labels, focus-visible controls, modal semantics, responsive navigation, reduced-motion support.

## Technology

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Data | Local typed fixtures |
| Visualization | Native SVG and CSS (no chart SaaS) |
| Tests | Vitest |
| Hosting | Static GitHub Pages deployment workflow |

## Run locally

Requirements: Node.js **22.12+** and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (the configured base path is `/ops-control-dashboard/`).

```bash
npm test          # domain and persistence tests
npm run typecheck # strict TypeScript
npm run build     # production bundle in dist/
npm run preview   # preview the production bundle
```

> The starter archive includes `PUBLISH-WINDOWS.ps1` to publish from the correct project directory. It does not bundle `node_modules` or `package-lock.json` because the build environment used to prepare the archive could not access npm. Run `npm install` to generate the lockfile, then commit it for reproducible deployments. The GitHub CI workflow uses `npm install` until that file is committed.

## Publish to GitHub Pages

The project is configured for the repository `hirques/ops-control-dashboard`:

1. Create a **public, empty** GitHub repository named `ops-control-dashboard`. Do **not** initialize it with a README, .gitignore, or license (if using the script). Or see the alternate GitHub-assisted method in [PUBLISHING.md](PUBLISHING.md).
2. Upload the project **contents directly to the repository root**, or execute `PUBLISH-WINDOWS.ps1` from inside the extracted project folder (not an extra nested `ops-control-dashboard/` folder).
3. Wait for the **CI** workflow to finish successfully in **Actions**.
4. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
5. In **Actions → Deploy demo to GitHub Pages → Run workflow**, select `main` and execute.
6. After the deployment is green, visit **https://hirques.github.io/ops-control-dashboard/**.

Pages deployment is manual on purpose: until Pages is enabled, CI stays independent and there are no misleading failed deployment runs. Once Pages is enabled, adjust `.github/workflows/pages.yml` to include `push` on `main` if automatic deployment is desired.

## Repository structure

```
src/
  App.tsx                    # navigation, views, incidents, export
  components/TrendChart.tsx  # accessible, interactive SVG chart
  components/Icons.tsx       # small icon set
  demo-data.ts               # sample services and time series
  domain.ts                  # status calculations and incident transitions
  store.ts                   # safe browser-local state persistence
  *.test.ts                  # unit tests
  styles.css                 # original responsive design system
.github/workflows/ci.yml     # typecheck + unit tests + build
.github/workflows/pages.yml  # manual Pages deployment
```

## Design decisions

The important part of this portfolio project isn't a static template. Service health derives from unresolved incident severity, so acknowledging an alert does not hide its impact, while resolution updates both the service table and availability snapshot. Actions create an activity trail, but only inside the current browser. See [architecture notes](docs/ARCHITECTURE.md).

## Future scope (not implemented)

The project could support an API with authenticated users, an agent/collector, historical monitoring samples, and streaming notifications. These are architecture directions, **not current features**.

## License

MIT — see [LICENSE](LICENSE).
