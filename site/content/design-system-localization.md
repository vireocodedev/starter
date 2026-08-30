# Localization and copy

Localization is part of interaction quality. Every string a user can encounter—including validation messages, toasts, tooltips, status updates, and accessible labels—belongs to a named localization namespace.

## Copy and key contract

English is the canonical fallback and every supported locale has exact key parity. Register namespaces explicitly: global shell and navigation copy belongs to an application namespace, feature copy belongs to its feature namespace, and unique route copy belongs to its page namespace. Do not hide missing translations behind ad hoc fallback text.

Use semantic keys, interpolation, and pluralization instead of assembling translated fragments. Locale identifiers are BCP 47-compatible. Enum translation keys preserve the enum's canonical uppercase or upper-snake-case value so a value can map predictably to localized copy. Derive static option lists from the domain enum or capability contract rather than duplicating them by hand.

## Formatting and layout

Models and API boundaries keep canonical values. Format dates, times, numbers, and currency only at the presentation boundary with an explicit locale and, where relevant, timezone. Do not route money or identifiers through lossy JavaScript-number conversions.

Localized copy can change line wrapping and therefore geometry. Exact loading and responsive contracts test the default and longest supported locale, rather than assuming English measurements are universal. Known localized labels, headings, and actions remain accessible during loading.

Every locale must preserve the same task, error meaning, and accessible name—not merely translate visible body text. Pair this guide with [forms and validation](/docs/design-system/forms-and-validation/), [loading states](/docs/design-system/loading-states/), and the [quality checklist](/docs/design-system/quality-and-release/).
