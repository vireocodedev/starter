# Backend parity — decision

Roadmap step 3.3. The question: the frontend ships as seven independently
versioned npm packages, while the backend is Spring Boot source that gets copied
into each app. The backend holds auth, RBAC, migrations and the query-engine
contract that the frontend packages are shaped around, so the asymmetry is not
cosmetic.

## Decision

**The generic backend becomes published Maven artifacts**, developed in this
repository alongside the TypeScript packages, published to GitHub Packages under
the same organisation.

Template-only was the alternative and is rejected: a second and third backend
consumer are expected, and copied source across three apps reproduces exactly
the drift that Phases 1 through 3 exist to eliminate.

## Why this is possible — measured, not assumed

Counts are `.java` files under `src/main/java/com/vireocode/vireo_app/`, taken
from `vireo-template` after the 3.2 extraction.

| Package               | Files | Generic |
| --------------------- | ----- | ------- |
| `starter/offline`     | 30    | yes     |
| `starter/queryengine` | 25    | yes     |
| `starter/base`        | 10    | yes     |
| `starter/web`         | 6     | yes     |
| `starter/config`      | 4     | yes     |
| `starter/security`    | 2     | yes     |
| `app/auth`            | 7     | yes     |
| `app/filters`         | 7     | yes     |
| `app/history`         | 5     | yes     |
| `app/account`         | 1     | yes     |
| `app/item`            | 7     | example |

Two facts make extraction tractable:

1. **`grep -rn "import com.vireocode.vireo_app.app\." starter/` returns nothing.**
   There are zero inbound references from `starter/` to `app/`. The dependency
   direction is already correct; 53 imports run the other way.
2. **Both problem enums are `@Enumerated(EnumType.STRING)`**, so they already
   persist as `VARCHAR`. Opening them is a source change, not a data migration.

## Why it is not possible _today_

Adding the `Item` entity in 3.2 required editing two enums that live inside
`starter/`. A consumer cannot edit an enum that ships inside a JAR.

- `starter/base/HistoryEntityType` — every member is an app-domain entity.
- `starter/queryengine/QueryEntityKey` — same, plus `SAVED_FILTER` and
  `OFFLINE_SYNC_COMMAND`.

Bringing auth into the library exposes a third: `app/auth/AppUserRole`, whose
`USER` and `SUPERADMIN` members are already hardcoded as string literals inside
`starter/security/SecurityExpressions`. The library therefore leaks the app's
role model today, in both directions.

`HistoryEntityType` is additionally pinned by the `ck_history_entity` CHECK
constraint in `V1__baseline_schema.sql`, so widening it currently demands a
migration in the consuming app.

**The frontend already solved this.** `QueryEngineEntityKey` in the published
`@vireocodedev/starter-queryengine` is just `string`, and `MANAGEMENT_ENTITIES`
is app-owned. The backend is the half that never got the treatment.

### The fix: extensible enums

Replace each closed enum with an interface the library owns and the app
implements, which keeps compile-time safety in the app while opening the set:

```java
// library
public interface QueryEntityKey {
    String name();
}

// consuming app
public enum AppQueryEntityKey implements QueryEntityKey {
    ITEM,
    SAVED_FILTER,
    OFFLINE_SYNC_COMMAND
}
```

Consequences, all of them simplifications:

- `QueryEngineRegistry` drops its `EnumMap` and its `QueryEntityKey.values()`
  completeness check. The check is redundant once the app's
  `QueryEntityTypeResolver` is the sole source of the key set — it currently
  verifies a map against an enum the same app also had to edit.
- `SavedFilter.entityName`, `HistoryEntry.entity` and `AppUser.role` become
  `String`. The columns are already `VARCHAR(255)`, `VARCHAR(32)` and
  `VARCHAR(50)`; no data migration.
- **`ck_history_entity` is dropped.** A library cannot own a constraint whose
  permitted values the consumer defines. This also retires the "widening the
  enum needs an accompanying migration" wart documented in 3.2.

## Artifact shape

Group `com.vireocode`, Java package root `com.vireocode.starter`, mirroring the
npm packages where a real mirror exists:

| Artifact                    | Contents                                | Frontend mirror          |
| --------------------------- | --------------------------------------- | ------------------------ |
| `vireo-starter-core`        | `base`, `web`, `security`, `config`     | `starter-infrastructure` |
| `vireo-starter-queryengine` | `queryengine` + saved filters           | `starter-queryengine`    |
| `vireo-starter-offline`     | `offline` sync, hydration, SSE batching | `starter-sqlite`         |
| `vireo-starter-history`     | history recorder, entity, controller    | `starter-history`        |
| `vireo-starter-auth`        | session auth, users, roles, account     | —                        |
| `vireo-starter-bom`         | version alignment platform              | —                        |

Coordinates read `com.vireocode:vireo-starter-queryengine:1.0.0`. The
`vireo-starter-` prefix is deliberate: these _are_ Spring Boot starters in the
technical sense — they will ship auto-configuration — so the name will read
correctly to a Java developer.

The BOM is not optional. Five artifacts that must move in lockstep need a
platform, or consumers will mix versions across a contract boundary.

### Scoping, resolved

- **`app/filters` (7 files)** moves into `vireo-starter-queryengine`. The
  saved-filter feature is the query engine's persistence half.
- **`app/auth` (7) and `app/account` (1)** move into `vireo-starter-auth`,
  shipped as a replaceable default rather than a fixed mechanism.

## Auth as a replaceable default

Auth is a library, not a fixture. The whole surface is 592 lines including
`SecurityConfig` and the dev bootstrap, and `SecurityConfig` is already ~90%
generic SPA plumbing: cookie CSRF with a `SpaCsrfTokenRequestHandler`, JSON
error bodies, session policy. Only a single hardcoded `hasRole("SUPERADMIN")`
guard on the Swagger routes is app-specific.

Three seams make it extensible, and all three are Spring's own conventions
rather than invented ones:

1. **The role model.** `AppUserRole { USER, SUPERADMIN }` is a third closed
   enum, and `starter/security/SecurityExpressions` hardcodes those two names as
   string literals inside the library. It gets the same interface treatment as
   the other two enums. `role` is `@Enumerated(EnumType.STRING)` on
   `VARCHAR(50)`, so again no data migration.
2. **The user store.** `AppUser`, `AppUserRepository` and
   `DatabaseUserDetailsService` ship as the default JPA implementation behind
   `@ConditionalOnMissingBean`. A consumer that wants LDAP, OIDC or an existing
   user table supplies its own `UserDetailsService` bean and the default backs
   off. Nothing is forked.
3. **The filter chain.** The `SecurityFilterChain` is also
   `@ConditionalOnMissingBean`, plus a customizer hook so a consumer can add
   matchers without replacing the whole chain — the common case, and the one
   that otherwise forces a copy-paste fork.

This shape leaves room for `vireo-starter-auth-oidc` or `-ldap` as sibling
artifacts later, without disturbing anything that already depends on the
session-based default.

## Where the source lives

**In this repository**, under a top-level `jvm/` Gradle build, beside
`packages/`:

```text
starter/
├── package.json          turbo drives everything under packages/
├── packages/
│   ├── queryengine/      @vireocodedev/starter-queryengine
│   └── ...
└── jvm/
    ├── settings.gradle   includes the modules below
    ├── core/             com.vireocode:vireo-starter-core
    ├── queryengine/      com.vireocode:vireo-starter-queryengine
    ├── offline/
    ├── history/
    ├── auth/
    └── bom/
```

This is the load-bearing part of the decision. The roadmap's stated risk is that
"a query-engine contract change must move on both sides in lockstep". One
repository makes that a single reviewable PR. Two repositories make it a
convention that will be broken the first time someone is in a hurry.

The two toolchains do not need to meet: `turbo` drives `packages/`, Gradle
drives `jvm/`, and CI runs them as separate jobs.

## Completion criteria

The backend half is done when all of the following hold. This replaces the
"what does done mean for something unversioned" problem — it is now the ordinary
library bar.

1. The six artifacts publish to GitHub Packages under `com.vireocode` with
   semver, from a tagged release, using the same changeset-equivalent discipline
   as the npm side.
2. `vireo-template` declares them as dependencies and its
   `src/main/java/**/starter/` directory **no longer exists**.
3. Wiring works through `@AutoConfiguration` and a
   `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
   entry — not through the consumer widening `@SpringBootApplication` component
   scanning. Library JPA entities and repositories are picked up via
   `@EntityScan` / `@EnableJpaRepositories` declared by the auto-configuration,
   not by the app.
4. Library-owned tables (`sync_command`, `offline_entity_version`, `history`,
   `app_user`) ship library-owned Flyway migrations in a dedicated location.
   Consumer migrations never modify them, and a library upgrade never renumbers
   a consumer's history.
5. A public-API gate exists on the JVM side equivalent to roadmap 1.3 and 1.4 on
   the TypeScript side, so an accidental widening of the surface fails CI.
6. None of `QueryEntityKey`, `HistoryEntityType` or `AppUserRole` is a closed
   enum, and adding an entity or a role in a consumer requires **zero** edits to
   library source.
7. A consumer can replace the `UserDetailsService` or the `SecurityFilterChain`
   with its own bean and the library defaults back off, without a fork.
8. A cold clone of `vireo-template` builds and tests green with no local
   checkout of the JVM library present.
9. **Lockstep rule:** any change to the query-engine wire contract lands as one
   PR touching both `packages/queryengine` and `jvm/queryengine`, and both sides
   release together. A contract change that ships on one side only is a defect,
   not a partial delivery.

## Effect on the roadmap

This decision materially expands Phase 3; it should not be pretended otherwise.
Phase 3 grew from six steps to twelve. The implementation was inserted as steps
3.4 through 3.9, and the three pre-existing steps shifted down:

| Step | Work                                         |
| ---- | -------------------------------------------- |
| 3.4  | Open the closed backend enums                |
| 3.5  | Stand up the `jvm/` multi-module build       |
| 3.6  | Auto-configure the JVM modules               |
| 3.7  | Split Flyway ownership                       |
| 3.8  | Publish the JVM artifacts                    |
| 3.9  | Cut the template over to published artifacts |
| 3.10 | Create the template repository (was 3.4)     |
| 3.11 | Cold-start timing run (was 3.5)              |
| 3.12 | Reposition leather-production (was 3.6)      |

"Create the template repository" had to move after the cutover: porting the
backend as source and later replacing it with dependencies means doing the port
twice.

Step 3.4 is deliberately first and standalone. It is a pure improvement to the
current single-module app, it is zero-schema-change apart from dropping one
constraint, it is verifiable against the existing backend suite, and every other
step is blocked behind it.
