# Versions

Human documentation follows a friendly Vireo line. Exact npm packages, the CLI, JVM modules and the template retain independent semantic versions underneath it.

## Current Vireo {{DOCS_VERSION}}

| Artifact                | Current value              |
| ----------------------- | -------------------------- |
| Documentation           | `{{DOCS_VERSION}}`         |
| Exact release snapshot  | `{{EXACT_RELEASE_ID}}`     |
| create-vireo            | `{{CREATE_VIREO_VERSION}}` |
| JVM module family       | `{{JVM_VERSION}}`          |
| Current guides          | `/docs/`                   |
| Version-specific guides | `/docs/{{DOCS_VERSION}}/`  |

The complete npm package and template mapping is available in machine-readable [`/versions.json`](/versions.json).

## URL policy

- `/docs/...` always represents the current supported documentation.
- `/docs/{{DOCS_VERSION}}/...` represents the version-specific copy.
- TypeScript, Java and Storybook links resolve to the exact immutable release snapshot.
- Older documentation displays a banner and links back to current guidance.

## Support boundary

Vireo is public `0.x` software. Minor releases may contain breaking changes and must include migration guidance where a supported upgrade path exists. Patch releases should remain compatible within their declared line.

## Unreleased documentation

Changes intended for a future Vireo line should not silently replace the current public docs. They belong in reviewed source changes and become current only with the matching release manifest.

See [Project upgrades](/docs/upgrades/) for the CLI workflow.
