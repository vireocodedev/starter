# @vireocodedev/starter-sqlite

Reusable SQLite runtime primitives for starter applications.

This package provides:
- OPFS SQLite bootstrap + migration execution
- Worker-side request dispatch runtime
- Client-side worker transport/runtime
- Generic worker config builder for injected migrations/handlers

The host application remains responsible for:
- Entity bundle definitions
- Migration discovery/content
- App-specific request handlers (hydration, SSE, queue internals)

## Install

```bash
npm install @vireocodedev/starter-sqlite
```
