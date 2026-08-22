---
"@vireocodedev/starter-sqlite": major
"@vireocodedev/starter-ui": patch
---

Complete the framework-free SQLite package audit: consolidate on the managed worker runtime and complete offline queue, recover after Worker failures, reject duplicate handlers and invalid entity configuration, strictly validate persisted queue data, and make source imports portable. Remove the obsolete `createSqliteClientRuntime` and legacy offline-sync SQLite exports. Add comprehensive package guidance and executable SQLite pages to the unified Vireo Storybook.
