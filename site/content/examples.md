# Examples

Vireo examples are organized by the question they answer. Start with an end-to-end workflow; use isolated component examples only when you need to inspect a state or API.

## Flagship demo

The [deployed flagship](https://demo.vireocode.com) demonstrates login, responsive operational UI, Item workflows, PWA behavior and the current full-stack composition. Use `demo` / `demo123`.

The demo is a resettable public sandbox with no uptime SLA. Do not enter private or sensitive data.

## Thirty-minute vertical slice

The [Purchase Order tutorial](/docs/guides/30-minute-vertical-slice/) shows project creation, dry-run generation, a complete capability, contract checking and authoritative verification.

## Frontend-only integration

The [frontend-only guide](/docs/getting-started/frontend-only/) starts with deterministic in-memory adapters and then replaces them with a company HTTP boundary.

## Interactive component states

[Storybook](/storybook/) contains the broad visual catalogue: responsive variants, loading and failure states, narrow layouts, forms, overlays, tables, hooks and integration examples.

## Exact generated output

Every generated project contains a reviewed Purchase Order schema under `.vireo/examples/`. Use `--diff` or `--output` to inspect the planned tree without modifying the project.
