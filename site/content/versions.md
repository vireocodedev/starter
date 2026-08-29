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

Vireo is public `0.x` software and applies Semantic Versioning to every published package family. Breaking public-contract changes require a major release even during `0.x`; minor releases add compatible capability, and patches remain compatible within their declared line. Where coordinated application changes are needed, the release also publishes migration and deployment-order guidance.

## Unreleased documentation

Changes intended for a future Vireo line should not silently replace the current public docs. They belong in reviewed source changes and become current only with the matching release manifest.

See [Project upgrades](/docs/upgrades/) for the CLI workflow.
