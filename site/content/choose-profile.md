# Choose a project profile

Profiles describe repository ownership, not product ambition. The frontend-only profile can power a large enterprise UI; the full-stack profile can power a small focused service.

## Comparison

| Concern                      | Frontend-only                                      | Full-stack                                                        |
| ---------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| React application            | Included                                           | Included                                                          |
| Mock development adapters    | Included                                           | Included where useful                                             |
| Company HTTP API integration | Replace adapter slots                              | Replace or use generated Spring API                               |
| Java and Gradle              | Not generated                                      | Included                                                          |
| Flyway and database          | Not generated                                      | H2 or PostgreSQL                                                  |
| Entity generation            | Models, API, page, localization, stories and tests | Frontend plus DTO, controller, service, persistence and migration |
| Best fit                     | Separately owned backend                           | Coordinated vertical product team                                 |

## Choose frontend-only when

- Frontend and backend live in separate repositories.
- Another team controls the API lifecycle.
- The backend is not Java or is outside the Vireo adoption scope.
- You want Vireo's UI, generation and contract checks without server infrastructure.

Read [Frontend-only applications](/docs/getting-started/frontend-only/) and [Adapters and company APIs](/docs/concepts/adapters/).

## Choose full-stack when

- One team owns the complete vertical slice.
- Spring Boot is an accepted backend platform.
- You want the generated wire contract exercised on both sides.
- A coordinated database migration belongs in the same change.

Read [Full-stack applications](/docs/getting-started/full-stack/) and [Spring Boot foundations](/docs/spring/).

## You can still mix adoption styles

A full-stack repository can generate a frontend-only capability with `--target frontend`. An organization can also consume individual npm or Maven artifacts without using either generated project profile.

The profile is a starting composition, not a permanent lock-in mechanism.
