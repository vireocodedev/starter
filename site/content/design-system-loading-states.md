# Loading states

The loading-state standard is normative for any Vireo visual surface that represents asynchronous work. Its purpose is to preserve context, prevent avoidable layout shift, communicate state accessibly, and make behavior testable.

## Choose the treatment in order

1. Preserve usable content when it already exists.
2. When only an action is pending, communicate busy state at that action.
3. When no usable content exists and the final structure is known, replace only unknown leaves with a structure-preserving skeleton.
4. When final structure is unknown, retain content or show progress rather than inventing detailed geometry.
5. Delay transient loading feedback so quick work does not flash a skeleton.

Every async-capable surface declares the applicable category: `static`, `content-preserving`, `skeleton-capable`, `busy-action`, or `boundary`. A visual component must not acquire a loading API merely because it is visible; the closest surface that understands the operation owns loading timing and state.

## State and structural contract

Define the applicable transitions from initial loading to content, empty, or error; content through refreshing to updated content or refresh error; and mutation to success or recoverable error. A refresh retains stale, usable content. An empty or error state occupies the affected content region and leaves unrelated usable content in place.

A skeleton may replace content leaves, never independently reproduce layout geometry. Loaded and skeleton states share page frames, containers, headers, action regions, grids, typography wrappers, cards, rows, fields, padding, borders, radii, scrolling, and pagination. Known titles, labels, headings, navigation, instructions, and actions remain visible whenever possible. Skeleton leaves are non-interactive and hidden from the accessibility tree.

| Geometry level         | Use when                                                     | Contract                                                                                                                              |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| A — exact              | Structure and geometry-reserving content are known           | Share structure; major anchors differ by at most 1 CSS pixel in browser verification; unexpected layout shift stays at or below 0.01. |
| B — bounded            | Structure is known but text, count, or media dimensions vary | Fix outer frame and controls; document bounds such as line clamps, minimum heights, aspect ratios, or row sizes.                      |
| C — estimated/progress | Destination structure is not reliably known                  | Do not present an invented detailed skeleton as exact; use retained content or progress.                                              |

Level A is the default when the information needed to reserve geometry is locally available.

## Timing, accessibility, and component behavior

Use shared semantic tokens. The default reveal delay is 150 ms, content transition is 120 ms, and a calm skeleton pulse lasts 1,400 ms. Do not mount transient feedback before the reveal delay unless a direct user action needs immediate acknowledgment, and do not delay content to satisfy a minimum skeleton duration. Reduced motion disables skeleton animation and nonessential loading transitions; the skeleton structure remains available to communicate pending content.

The owning boundary applies `aria-busy` to the smallest stable pending region and provides one useful polite status when waiting becomes visible or materially affects interaction. Nested boundaries do not duplicate an ancestor's announcement. Preserve accessible names and focus; disable a control only when another invocation would be unsafe.

Tables retain filters, headers, pagination, and safe prior rows. Forms retain known labels and use their real structure; submission is a busy action, not a form skeleton. Overlays retain their title, close action, frame, and focus management. Cards retain their frame and known actions. Destructive actions retain enough target context until success is confirmed.

## Evidence and exceptions

Document or demonstrate every applicable loaded, loading, refreshing, empty, error, and alignment state. Verification covers responsive modes, localization, color schemes, reduced motion, accessibility announcements, recovery transitions, and unexpected layout shift. An exception to a required rule must identify the affected surface and geometry level, user-visible consequence, owner, and review or remediation condition.

Read [motion](/docs/design-system/motion/), [forms and validation](/docs/design-system/forms-and-validation/), and [quality and release](/docs/design-system/quality-and-release/) for the surrounding contracts.
