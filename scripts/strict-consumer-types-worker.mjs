#!/usr/bin/env node
import { isAbsolute, relative, resolve, sep } from "node:path";
import ts from "typescript";

// One worker owns one package-level TypeScript program. Keeping those programs
// separate prevents one package's ambient declarations from masking another's
// consumer errors while still allowing independent packages to run in parallel.
const [repoRoot, packageDir, ...entryPoints] = process.argv.slice(2);
const distDir = resolve(packageDir, "dist");

const convertedOptions = ts.convertCompilerOptionsFromJson(
  {
    jsx: "react-jsx",
    lib: ["ES2022", "DOM", "DOM.Iterable"],
    module: "ESNext",
    moduleResolution: "Bundler",
    noEmit: true,
    skipLibCheck: false,
    strict: true,
    target: "ES2022",
  },
  repoRoot,
);
const program = ts.createProgram({
  rootNames: entryPoints,
  options: convertedOptions.options,
});
const diagnostics = [...convertedOptions.errors, ...ts.getPreEmitDiagnostics(program)];

function isInsideDist(fileName) {
  const relativePath = relative(distDir, resolve(repoRoot, fileName));
  return (
    relativePath === "" || (!relativePath.startsWith(`..${sep}`) && relativePath !== ".." && !isAbsolute(relativePath))
  );
}

function formatDiagnostic(diagnostic) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start === undefined) {
    return `error TS${diagnostic.code}: ${message}`;
  }

  const fileName = resolve(repoRoot, diagnostic.file.fileName);
  const { character, line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return `${relative(repoRoot, fileName)}(${line + 1},${character + 1}): error TS${diagnostic.code}: ${message}`;
}

const result = {
  compilerErrors: diagnostics.filter(diagnostic => !diagnostic.file).map(formatDiagnostic),
  errors: diagnostics
    .filter(diagnostic => diagnostic.file && isInsideDist(diagnostic.file.fileName))
    .map(formatDiagnostic),
};

if (process.send) {
  process.send(result);
} else {
  process.stdout.write(JSON.stringify(result));
}
