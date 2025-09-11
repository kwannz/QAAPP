# Logging & Verbose Mode

This app ships with a unified, structured logging system for both API (NestJS) and Web (Next.js).

## Quick Start

- Development verbose logs (both API and Web):
  - `LOG_LEVEL=VERBOSE pnpm dev`
  - Or set Web only: `NEXT_PUBLIC_LOG_LEVEL=DEBUG pnpm --filter @qa-app/web dev`
- PM2: set env then view: `LOG_LEVEL=VERBOSE pnpm pm2:logs`

## API (NestJS)

- Levels: `VERBOSE, DEBUG, INFO, WARN, ERROR, CRITICAL` via `LOG_LEVEL`.
- Files (daily rotate) in `logs/` when not in development:
  - `app-*.log`, `errors-*.log`, `requests-*.log`, `performance-*.log`, `audit-*.log`.
- Request tracing: `X-Request-ID` header is attached; interceptors record method, URL, status, response time, IP and UA.
- Client log ingestion: Web can POST logs to `/api/monitoring/logs` (see Web section). Logs are appended to `logs/client-logs-YYYY-MM-DD.log`.
- Optional flags:
  - `ENABLE_FILE_LOGGING=true|false`
  - `ENABLE_DB_LOGGING=true|false` (hooks available; currently disabled for ingestion)

## Web (Next.js)

- Levels: `VERBOSE, DEBUG, INFO, WARN, ERROR, CRITICAL` via `NEXT_PUBLIC_LOG_LEVEL`.
- Runtime override:
  - URL param `?log=debug|verbose|info|warn|error|critical`
  - Console API: `window.QALogger.setLevel('DEBUG')`
- Error logs (>= ERROR) are sent to the API using `navigator.sendBeacon('/api/monitoring/logs', payload)` (falls back to `fetch`).
- Helpers: `logger.info('Module', 'message', data)` and `startTiming/endTiming` for performance marks.

## Examples

- API route timing:
  - `const t0 = Date.now(); ... logger.logPerformance('generateReport', Date.now() - t0, { reportId });`
- Web fetch logging:
  - `startTiming('fetchProducts'); ... endTiming('fetchProducts', 'Products');`

## Troubleshooting

- No client log files? Ensure API has write permission to `logs/`.
- Too chatty? Lower log level: `LOG_LEVEL=INFO NEXT_PUBLIC_LOG_LEVEL=INFO`.
- CI: prefer `INFO` to keep outputs compact.

## E2E Auth Notes

Two E2E login paths are provided:

- Simulated login (default, stable):
  - Seeds `localStorage('qa-auth-storage')` before app loads, then navigates to `/dashboard?e2e_auth=skip`.
  - File: `tests/e2e/auth-login.spec.ts`

- Real login against API (opt-in):
  - Requires API JWT env set and seeded admin.
  - Enable by exporting `PLAYWRIGHT_ALLOW_REAL_LOGIN=true`.
  - Env vars:
    - `PLAYWRIGHT_API_URL` (default `http://localhost:3001/api`)
    - `PLAYWRIGHT_LOGIN_EMAIL` (default `admin@qa-app.com`)
    - `PLAYWRIGHT_LOGIN_PASSWORD` (default `Admin123!`)
  - Run:
    - `PLAYWRIGHT_ALLOW_REAL_LOGIN=true pnpm test:e2e -- tests/e2e/auth-login-real.spec.ts`
