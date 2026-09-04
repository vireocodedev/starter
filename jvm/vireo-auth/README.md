# Vireo Auth

Replaceable database-backed session authentication for Spring Boot applications.

Auth owns a secure default `SecurityFilterChain`, JSON login/logout/current-user endpoints, optional account-management endpoints, password encoding, a database `UserDetailsService`, and the `app_user` migration. Applications own their role catalog, password policy, user lifecycle, production identity-provider choice, and domain authorization.

## Installation

Gradle:

```groovy
dependencies {
    implementation platform("com.vireocode:vireo-bom:0.3.1")
    implementation "com.vireocode:vireo-auth"
}
```

Maven:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.vireocode</groupId>
      <artifactId>vireo-bom</artifactId>
      <version>0.3.1</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependency>
  <groupId>com.vireocode</groupId>
  <artifactId>vireo-auth</artifactId>
</dependency>
```

The dependency alone installs the defaults. A consumer can add narrower authorization rules through `StarterHttpSecurityCustomizer`, or replace `SecurityFilterChain`, `UserDetailsService`, `PasswordEncoder`, `AuthenticationManager`, `SessionAuthenticationStrategy`, or `Clock` with ordinary beans.

## Default endpoints

| Operation | Method | Default path |
| --- | --- | --- |
| Login | `POST` | `/api/auth/login` |
| Logout | `POST` | `/api/auth/logout` |
| Current user | `GET` | `/api/auth/me` |
| Change username | `PUT` | `/api/account/username` |
| Change password | `PUT` | `/api/account/password` |

All paths are configurable under `vireo.starter.auth`. The account endpoints are registered only with the default database `UserDetailsService`; replacing the user store withdraws them automatically.

## Configuration defaults

```properties
vireo.starter.auth.endpoints-enabled=true
vireo.starter.auth.account-endpoints-enabled=true
vireo.starter.auth.login-path=/api/auth/login
vireo.starter.auth.logout-path=/api/auth/logout
vireo.starter.auth.current-user-path=/api/auth/me
vireo.starter.auth.change-username-path=/api/account/username
vireo.starter.auth.change-password-path=/api/account/password
vireo.starter.auth.api-path-pattern=/api/**
vireo.starter.auth.docs-role=
```

The default documentation matchers are `/v3/api-docs/**`, `/swagger-ui.html`, and `/swagger-ui/**`. An empty `docs-role` permits any authenticated user; a value requires that role. Emptying `docs-matchers` removes the special documentation rule.

## Security and failure semantics

- Login rotates an existing session ID before saving the authenticated security context.
- CSRF uses a JavaScript-readable cookie with Spring Security's BREACH-resistant request handling. Login and logout are excluded; state-changing authenticated endpoints require a token.
- Authentication and access-denied failures return stable JSON `ApiError` bodies without credentials or internal causes.
- Credential request models redact secrets from `toString()`.
- Invalid or colliding endpoint paths fail configuration binding at startup.
- A failing security customizer aborts startup rather than silently weakening the chain.

The default role model stores one application-authored role string and exposes it as one `ROLE_…` authority. Applications needing multiple authorities or an external identity provider should replace the default `UserDetailsService` and, when the current-user response is insufficient, the default endpoints.

## Persistence

Auth owns `app_user` and the module-specific `flyway_schema_history_vireo_auth` history. The published V1 migration is immutable. `StarterUser` and `StarterUserRepository` are the supported persistence API only for applications deliberately using this default database user model; external identity-provider integrations should not depend on them.

## Documentation

The unified Vireo Starter Storybook contains the Auth guide and displays Java source compiled by `vireo-starter-documentation-examples`. Javadocs remain the complete API reference.
