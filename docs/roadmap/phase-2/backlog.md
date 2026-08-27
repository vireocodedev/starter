# Phase 2 — golden-path developer experience

Phase 2 turns the public framework and Template into one reproducible first-run path. Engineering completion and the external-human exit gate are tracked separately; automation and AI clean rooms do not count as unfamiliar human testers.

| ID      | Deliverable                   | Definition of done                                                                                                                                                           | Status                                                                          |
| ------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `P2-00` | Scope and decisions           | D-107 and D-108 are resolved with explicit supported variants and non-goals.                                                                                                 | Done                                                                            |
| `P2-01` | Minimal Template              | The Item capability is the only end-to-end product example; kitchen-sink/dev-tool pages are absent from the generated app.                                                   | Done                                                                            |
| `P2-02` | Canonical create coordinate   | `npm create vireo@latest` maps to public package `create-vireo`; npm is the one Phase 2 package manager.                                                                     | Implemented; first registry publication pending                                 |
| `P2-03` | Safe creation engine          | A pinned public Template commit is downloaded, validated, customized, staged, and atomically installed without overwriting targets.                                          | Done                                                                            |
| `P2-04` | Interactive and automated CLI | Prompts plus `--yes`, naming, Java package, database, Git, dry-run, and JSON options are tested.                                                                             | Done                                                                            |
| `P2-05` | Root workflow                 | Root `setup`, `doctor`, `dev`, and `verify` commands cover frontend, backend, and the selected database.                                                                     | Done                                                                            |
| `P2-06` | Doctor diagnostics            | Stable `VIR-*` codes check toolchains, dependencies, metadata, package alignment, ports, database tooling, and PWA configuration without exposing secrets or personal paths. | Done                                                                            |
| `P2-07` | Learning and recovery         | A 30-minute vertical-slice tutorial and code-indexed remedy guide ship in the Template.                                                                                      | Done                                                                            |
| `P2-08` | Clean-room and exit evidence  | Automated matrices pass; at least 70% of unfamiliar external human testers run the app without help.                                                                         | Automated engineering evidence complete; unfamiliar-human gate needs validation |

## Supported creation matrix

- Package manager: npm 12.0.2 through Corepack.
- Runtime: Node 24.15–24.x and JDK 21; JDK 25 remains a compatibility lane.
- Database: PostgreSQL by default; H2 by explicit selection and in the source Template's zero-service path.
- Naming: lowercase kebab-case project name and configurable lowercase Java package.
- Git: initialized by default, explicitly disableable.
- Authentication and offline policy: the reviewed Template defaults; variant generation is deferred until evidence justifies another supported composition.

## Non-goals

- `vireo upgrade` remains G-203 and needs a released create baseline before its compatibility design is honest.
- Full-stack entity generation remains G-204 and Phase 3.
- Removed kitchen-sink pages are not promoted to stable framework APIs. Independently valuable examples can be restored later in a separate, explicitly unsupported examples repository.
