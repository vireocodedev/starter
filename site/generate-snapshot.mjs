import { createCurrentSnapshotArchive, serializeSnapshotArchive } from "./build.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const archive = createCurrentSnapshotArchive();
const serialized = `${JSON.stringify(serializeSnapshotArchive(archive), null, 2)}\n`;
if (process.argv.includes("--write")) {
  writeFileSync(join(import.meta.dirname, "content/snapshots", `${archive.documentationVersion}.json`), serialized);
} else {
  process.stdout.write(serialized);
}
