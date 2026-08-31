# P5-03 hosted-demo activation evidence — 2026-08-28

## Activated boundary

- Public URL: <https://demo.vireocode.com>
- Runtime revision: Template `aa7d17bb065626e9eac41b80e701b5b8a19552d8`
- Activation-policy revision: Template `802d488fac81e7ed829ce880197f55800df6f11f`
- Data boundary: disposable public synthetic data only
- Availability: best effort, no uptime or response-time SLA
- Owner: Vireo repository maintainers
- Incident path: [Template bug form](https://github.com/vireocodedev/vireo-template/issues/new?template=bug_report.yml)
- Security path: [private security advisory](https://github.com/vireocodedev/vireo-template/security/advisories/new)

## Deployment evidence

The Hetzner VPS runs Caddy as the public TLS boundary. Caddy proxies only to the
frontend on `127.0.0.1:3000`; the Spring Boot and PostgreSQL containers have no
published host ports. Compose health reported all three services healthy. The public
frontend returned the expected content-security, framing, MIME, referrer,
permissions, and browsing-context headers. Public `/healthz` returned `ok` and
`/actuator/health/readiness` returned `{"status":"UP"}`.

The deployed demo resource envelope is 384 MiB for PostgreSQL, 768 MiB for Spring
Boot, and 128 MiB for Nginx. Initial observed use was approximately 48 MiB, 291 MiB,
and 4 MiB respectively on the 2-vCPU/4-GB host.

## Monitoring and reset evidence

- Initial external health and authenticated read-only journey:
  [GitHub Actions run 33158935391](https://github.com/vireocodedev/vireo-template/actions/runs/33158935391)
- Dedicated-volume reset rehearsal completed at `2026-08-28T09:21:51Z`; retained
  host evidence:
  `/opt/apps/vireo-flagship-demo/operations/evidence/reset-20260828T092151Z.log`
- Post-reset external health and authenticated read-only journey:
  [GitHub Actions run 33159094461](https://github.com/vireocodedev/vireo-template/actions/runs/33159094461)
- Hourly monitoring is active through `.github/workflows/flagship-demo.yml`.
- The persistent `vireo-flagship-demo-reset.timer` is enabled and schedules the
  isolated reset within every 24-hour window.

The monitor uses a GitHub-hosted runner and verifies the public shell, frontend and
backend health, authentication, live overview, navigation, and deterministic seeded
inventory. It does not create independent-adopter, product-demand, production
readiness, or uptime evidence.
