# Spring Boot foundations

Vireo publishes a coordinated JVM module family under `com.vireocode`. Applications normally import the BOM, then select only the modules they need.

## Modules

| Module          | Role                                                   |
| --------------- | ------------------------------------------------------ |
| `vireo-bom`     | Aligns the supported Vireo JVM family                  |
| `vireo-core`    | Shared base contracts and errors                       |
| `vireo-auth`    | Authentication and authorization-supporting primitives |
| `vireo-query`   | Query and filtering contracts                          |
| `vireo-offline` | Server-side support for explicit offline workflows     |
| `vireo-history` | History and audit presentation contracts               |

The current coordinated JVM version is `{{JVM_VERSION}}`.

## Import through the BOM

```kotlin
dependencies {
  implementation(platform("com.vireocode:vireo-bom:{{JVM_VERSION}}"))
  implementation("com.vireocode:vireo-core")
  implementation("com.vireocode:vireo-query")
}
```

Resolve public artifacts from Maven Central. No GitHub or Vireo credentials are required.

## Application authority

Framework modules may standardize transport, querying and reusable security integration. The application still owns resource authorization, transactions, domain validation, persistence design, secret management and production observability.

## Generated backend code

The full-stack generator creates a reviewable DTO/controller/service/repository/migration skeleton. Move special domain behavior into application-owned services instead of expanding generator templates for one product.

For every public type and member, use the [Java API reference](/reference/java/).
