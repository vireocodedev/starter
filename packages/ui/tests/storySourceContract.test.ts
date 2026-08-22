import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Guards executable Vireo Storybook examples against documentation drift.
 *
 * Storybook's generated source renderer can expose a private render wrapper
 * instead of useful consumer code. Every Vireo story therefore owns a complete
 * TSX module that is both rendered and displayed through a `?raw` import. These
 * checks keep those two paths connected and keep the displayed module portable
 * to a project that consumes `@vireocodedev/starter-ui`.
 */

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(packageRoot, "src");

const VIREO_STORY_FILE_PATTERN = /^Vireo[A-Z]\w*\.stories\.tsx$/u;
const EXAMPLE_FILE_PATTERN = /^[A-Z]\w*Example\.tsx$/u;
const FORM_STORY_EXAMPLE_PATTERN = /\/capabilities\/forms\/components\/forms\/[^/]+\/internal\/storybook\//u;
const FORM_FIELD_STORY_FILE_PATTERN =
  /\/capabilities\/forms\/components\/forms\/VireoForm[A-Z]\w*Field\/VireoForm[A-Z]\w*Field\.stories\.tsx$/u;
const BOUND_FORM_FIELD_STORY_WHITELIST = new Set(["field.CheckboxField", "field.SwitchField"]);

function findFiles(directory: string, predicate: (file: string) => boolean): string[] {
  return readdirSync(directory).flatMap(entry => {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) return findFiles(full, predicate);
    return predicate(full) ? [full] : [];
  });
}

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && ts.getModifiers(node)?.some(modifier => modifier.kind === kind) === true;
}

function exportedStories(source: ts.SourceFile): Array<{ initializer: ts.ObjectLiteralExpression; name: string }> {
  return source.statements.flatMap(statement => {
    if (!ts.isVariableStatement(statement) || !hasModifier(statement, ts.SyntaxKind.ExportKeyword)) return [];

    return statement.declarationList.declarations.flatMap(declaration => {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) return [];
      if (!ts.isObjectLiteralExpression(declaration.initializer)) return [];
      return [{ initializer: declaration.initializer, name: declaration.name.text }];
    });
  });
}

function importedDefaults(source: ts.SourceFile): Map<string, string> {
  return new Map(
    source.statements.flatMap(statement => {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) return [];
      const binding = statement.importClause?.name?.text;
      return binding ? [[statement.moduleSpecifier.text, binding] as const] : [];
    }),
  );
}

function propertyValue(object: ts.ObjectLiteralExpression, name: string): ts.Node | undefined {
  const property = object.properties.find(candidate => {
    if (!ts.isPropertyAssignment(candidate)) return false;
    return (ts.isIdentifier(candidate.name) || ts.isStringLiteral(candidate.name)) && candidate.name.text === name;
  });

  return property && ts.isPropertyAssignment(property) ? property.initializer : undefined;
}

function referencesIdentifier(node: ts.Node | undefined, name: string): boolean {
  if (!node) return false;
  if (ts.isIdentifier(node) && node.text === name) return true;

  let found = false;
  ts.forEachChild(node, child => {
    if (!found && referencesIdentifier(child, name)) found = true;
  });
  return found;
}

function moduleSpecifiers(source: ts.SourceFile): string[] {
  return source.statements.flatMap(statement =>
    ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)
      ? [statement.moduleSpecifier.text]
      : [],
  );
}

function hasDefaultExport(source: ts.SourceFile): boolean {
  return source.statements.some(statement => {
    if (ts.isExportAssignment(statement)) return !statement.isExportEquals;
    return hasModifier(statement, ts.SyntaxKind.ExportKeyword) && hasModifier(statement, ts.SyntaxKind.DefaultKeyword);
  });
}

function jsxTagName(node: ts.JsxTagNameExpression, source: ts.SourceFile): string {
  return node.getText(source);
}

function isInsideVireoLabelBox(node: ts.Node, source: ts.SourceFile): boolean {
  let ancestor = node.parent;
  while (ancestor) {
    if (ts.isJsxElement(ancestor) && jsxTagName(ancestor.openingElement.tagName, source) === "VireoLabelBox") {
      return true;
    }
    ancestor = ancestor.parent;
  }
  return false;
}

function hasVisibleMuiInputLabel(node: ts.JsxOpeningLikeElement): boolean {
  const label = node.attributes.properties.find(
    property => ts.isJsxAttribute(property) && ts.isIdentifier(property.name) && property.name.text === "label",
  );
  if (!label || !ts.isJsxAttribute(label)) return false;
  if (!label.initializer) return true;
  if (ts.isStringLiteral(label.initializer)) return label.initializer.text.length > 0;
  if (!ts.isJsxExpression(label.initializer)) return true;
  const expression = label.initializer.expression;
  return (
    expression !== undefined && expression.kind !== ts.SyntaxKind.NullKeyword && expression.getText() !== "undefined"
  );
}

function hasAccessibleControlName(node: ts.JsxOpeningLikeElement, source: ts.SourceFile): boolean {
  return /(?:"aria-label(?:ledby)?"|aria-label(?:ledby)?\s*=)/u.test(node.getText(source));
}

function storyInputElements(source: ts.SourceFile, includeMuiTextField: boolean): ts.JsxOpeningLikeElement[] {
  const inputs: ts.JsxOpeningLikeElement[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = jsxTagName(node.tagName, source);
      if (
        (/^field\.[A-Z]\w*Field$/u.test(tagName) && !BOUND_FORM_FIELD_STORY_WHITELIST.has(tagName)) ||
        (includeMuiTextField && tagName === "TextField")
      ) {
        inputs.push(node);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return inputs;
}

const storyFiles = findFiles(srcRoot, file => VIREO_STORY_FILE_PATTERN.test(basename(file))).sort();

describe("Vireo executable story-source contract", () => {
  it("discovers the first-class Vireo story surface", () => {
    const storyCount = storyFiles.reduce((count, file) => count + exportedStories(parse(file)).length, 0);

    expect(storyFiles.length).toBeGreaterThanOrEqual(10);
    expect(storyCount).toBeGreaterThan(50);
  });

  it("groups bound form-field components under Capabilities/Forms/Fields", () => {
    const violations = storyFiles
      .filter(file => FORM_FIELD_STORY_FILE_PATTERN.test(file))
      .filter(
        file => !/title:\s*"Capabilities\/Forms\/Fields\/VireoForm[A-Z]\w*Field"/u.test(readFileSync(file, "utf8")),
      )
      .map(file => `${relative(packageRoot, file)}: expected a Capabilities/Forms/Fields story title`);

    expect(violations).toEqual([]);
  });

  it("renders and displays one matching executable module per story", () => {
    const violations: string[] = [];

    for (const storyFile of storyFiles) {
      const source = parse(storyFile);
      const imports = importedDefaults(source);
      const storyDirectory = dirname(storyFile);

      for (const story of exportedStories(source)) {
        const exampleName = `${story.name}Example`;
        const exampleModuleSuffix = `/internal/storybook/${exampleName}`;
        const rawModuleSuffix = `${exampleModuleSuffix}.tsx?raw`;
        const renderedImport = [...imports].find(([specifier]) => specifier.endsWith(exampleModuleSuffix));
        const rawImport = [...imports].find(([specifier]) => specifier.endsWith(rawModuleSuffix));
        const location = `${relative(packageRoot, storyFile)}#${story.name}`;

        if (!existsSync(join(storyDirectory, "internal", "storybook", `${exampleName}.tsx`))) {
          violations.push(`${location}: missing internal/storybook/${exampleName}.tsx`);
        }
        if (!renderedImport) {
          violations.push(`${location}: missing normal ${exampleName} import`);
        } else if (!referencesIdentifier(propertyValue(story.initializer, "render"), renderedImport[1])) {
          violations.push(`${location}: render does not use ${renderedImport[1]}`);
        }
        if (!rawImport) {
          violations.push(`${location}: missing ${exampleName}.tsx?raw import`);
        } else if (!referencesIdentifier(propertyValue(story.initializer, "parameters"), rawImport[1])) {
          violations.push(`${location}: parameters do not use ${rawImport[1]}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps every colocated example connected to a story", () => {
    const orphans = storyFiles.flatMap(storyFile => {
      const expected = new Set(exportedStories(parse(storyFile)).map(story => `${story.name}Example.tsx`));
      const exampleDirectory = join(dirname(storyFile), "internal", "storybook");
      if (!existsSync(exampleDirectory)) return [];

      return readdirSync(exampleDirectory)
        .filter(file => EXAMPLE_FILE_PATTERN.test(file) && !expected.has(file))
        .map(file => relative(packageRoot, join(exampleDirectory, file)));
    });

    expect(orphans).toEqual([]);
  });

  it("keeps displayed modules copy-pastable outside the repository", () => {
    const violations = storyFiles.flatMap(storyFile => {
      const exampleDirectory = join(dirname(storyFile), "internal", "storybook");
      if (!existsSync(exampleDirectory)) return [];

      return readdirSync(exampleDirectory)
        .filter(file => EXAMPLE_FILE_PATTERN.test(file))
        .flatMap(file => {
          const exampleFile = join(exampleDirectory, file);
          const source = parse(exampleFile);
          const specifiers = moduleSpecifiers(source);
          const location = relative(packageRoot, exampleFile);
          const errors: string[] = [];

          if (!hasDefaultExport(source)) errors.push(`${location}: missing default export`);
          if (!specifiers.some(specifier => specifier.startsWith("@vireocodedev/starter-ui"))) {
            errors.push(`${location}: does not import the public starter-ui package`);
          }

          for (const specifier of specifiers) {
            if (specifier.startsWith(".") || specifier.startsWith("@/") || specifier.startsWith("#/")) {
              errors.push(`${location}: private import ${JSON.stringify(specifier)}`);
            }
            if (
              specifier === "storybook" ||
              specifier.startsWith("storybook/") ||
              specifier.startsWith("@storybook/")
            ) {
              errors.push(`${location}: Storybook runtime import ${JSON.stringify(specifier)}`);
            }
          }

          if (source.text.includes("TODO(component-author)")) {
            errors.push(`${location}: unresolved generated consumer-import TODO`);
          }

          return errors;
        });
    });

    expect(violations).toEqual([]);
  });

  it("composes non-whitelisted form story inputs with VireoLabelBox", () => {
    const exampleFiles = findFiles(
      srcRoot,
      file => EXAMPLE_FILE_PATTERN.test(basename(file)) && file.includes("/internal/storybook/"),
    );
    const violations = exampleFiles.flatMap(exampleFile => {
      const source = parse(exampleFile);
      const inputs = storyInputElements(source, FORM_STORY_EXAMPLE_PATTERN.test(exampleFile));
      if (inputs.length === 0) return [];

      const location = relative(packageRoot, exampleFile);
      const errors: string[] = [];
      const importsLabelBox = source.statements.some(
        statement =>
          ts.isImportDeclaration(statement) &&
          ts.isStringLiteral(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text === "@vireocodedev/starter-ui" &&
          statement.importClause?.namedBindings?.getText(source).includes("VireoLabelBox"),
      );

      if (!importsLabelBox) errors.push(`${location}: missing public VireoLabelBox import`);
      for (const input of inputs) {
        const tagName = jsxTagName(input.tagName, source);
        if (!isInsideVireoLabelBox(input, source)) {
          errors.push(`${location}: ${tagName} is not inside VireoLabelBox`);
        }
        if (hasVisibleMuiInputLabel(input)) {
          errors.push(`${location}: ${tagName} uses a visible MUI input label`);
        }
        if (!hasAccessibleControlName(input, source)) {
          errors.push(`${location}: ${tagName} must retain an accessible control name`);
        }
      }

      return errors;
    });

    expect(violations).toEqual([]);
  });
});
