# Security policy

## Supported versions

Only the latest published version of each npm package and the latest published
JVM family are supported with security updates.

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private vulnerability-reporting flow
for `vireocodedev/starter`, including affected versions, reproduction steps,
impact, and any proposed mitigation.

If private reporting is unavailable, do not post vulnerability details publicly.
Open a detail-free issue stating only that the private reporting channel is
unavailable and ask a maintainer to restore a secure channel. Wait for a private
channel before sending reproduction material.

Maintainers target acknowledgement of a complete report within five business days,
then privately confirm severity, affected versions, remediation, and a coordinated
disclosure plan. This is a response target rather than a guaranteed fix deadline.
The project may use a GitHub Security Advisory and CVE for confirmed release-impacting
vulnerabilities.

Never include production credentials or personal data in a report.

## Handling and disclosure

Reporters should use test data and the minimum proof needed to demonstrate impact.
Do not access unrelated data, degrade service, persist access, or publicly disclose
an unremediated issue without first allowing reasonable coordination.

Maintainers follow the repository's
[incident and release recovery runbook](docs/security/incident-response.md). A
suspected credential exposure is revoked first; removing it from Git history alone
does not make it safe.
