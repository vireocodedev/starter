# Vireo JVM modules

The JVM build publishes a BOM and Spring-oriented modules consumed independently from the TypeScript packages.

- Preserve the BOM, module coordinates, Spring auto-configuration, and public Java API as release contracts.
- Keep application behavior and cross-runtime contracts explicit; do not rely on a local Maven cache in normal consumer validation.
- Add focused module tests and documentation examples for a changed public behavior. Coordinate Gradle-wide verification with the repository owner.
- Maven publishing, Central verification, signing, and release credentials are human-authorized release operations.

Read `README.md`, module READMEs, and `../docs/package-authoring/JVM_PACKAGES.md` before changing a public module.
