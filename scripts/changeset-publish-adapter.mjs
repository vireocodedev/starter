import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ansiEscape = /\u001B\[[0-?]*[ -/]*[@-~]/gu;
const coordinatePattern = /^(?:@[^/\s]+\/[^@\s]+|[^@\s]+)@[^\s]+$/u;

export function publishedCoordinates(output) {
  const plainOutput = output.replace(ansiEscape, "");
  const marker = "Successfully published:";
  const markerIndex = plainOutput.lastIndexOf(marker);
  if (markerIndex === -1) return [];

  const coordinates = [];
  for (const line of plainOutput.slice(markerIndex + marker.length).split("\n")) {
    const candidate = line.trim();
    if (coordinatePattern.test(candidate)) coordinates.push(candidate);
    else if (coordinates.length > 0) break;
  }
  return coordinates;
}

function main() {
  const result = spawnSync("changeset", ["publish", ...process.argv.slice(2)], {
    encoding: "utf8",
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;

  if (result.status === 0 && !/^New tag:/mu.test(result.stdout ?? "")) {
    for (const coordinate of publishedCoordinates(result.stdout ?? "")) {
      // changesets/action v1 recognizes this stable v2-era protocol while the
      // Changesets v3 CLI reports only a final "Successfully published" block.
      console.log(`New tag: ${coordinate}`);
    }
  }

  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
