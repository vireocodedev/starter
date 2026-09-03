import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createWebsiteDeploymentBundle } from "./build-deployment-bundle.mjs";

const commit = "a".repeat(40);
function bundle(root, runId = "42", home = "home") {
  const artifact = join(root, `artifact-${runId}`);
  mkdirSync(artifact);
  writeFileSync(join(artifact, "index.html"), home);
  writeFileSync(join(artifact, "healthz"), "ok\n");
  mkdirSync(join(artifact, "docs"));
  writeFileSync(join(artifact, "docs", "index.html"), "docs");
  const archive = join(root, `website-${runId}.tar`),
    manifest = join(root, `manifest-${runId}.json`);
  return {
    archive,
    manifest,
    value: createWebsiteDeploymentBundle({
      artifactRoot: artifact,
      archivePath: archive,
      manifestPath: manifest,
      repository: "vireocodedev/vireo",
      commit,
      runId,
      runAttempt: "1",
    }),
  };
}
function controller(root, verb, identity, generation) {
  const args = [
    "site/vireo-website-controller.py",
    verb,
    identity.runId,
    identity.runAttempt,
    identity.repository,
    identity.commit,
    identity.archiveSha256,
    String(identity.archiveBytes),
  ];
  if (generation !== undefined) args.push(String(generation));
  const result = spawnSync("python3", args, {
    cwd: process.cwd(),
    env: { ...process.env, VIREO_WEBSITE_ROOT: root, VIREO_WEBSITE_CONTROL_ROOT: join(root, "control") },
    encoding: "utf8",
  });
  return { ...result, json: result.stdout ? JSON.parse(result.stdout) : undefined };
}
test("website deployment bundle accepts GNU tar ./ proof paths, preserves a legacy current target through rollback, and later accepts", t => {
  if (spawnSync("tar", ["--version"], { encoding: "utf8" }).error?.code === "EPERM")
    return t.skip("sandbox forbids child-process archive tests; CI executes them");
  const root = mkdtempSync(join(tmpdir(), "vireo-site-cd-"));
  const built = bundle(root);
  mkdirSync(join(root, "host", "incoming"), { recursive: true });
  const host = join(root, "host"),
    legacy = join(host, "releases", "legacy");
  mkdirSync(legacy, { recursive: true });
  writeFileSync(join(legacy, "index.html"), "legacy");
  symlinkSync(legacy, join(host, "current"));
  execFileSync("cp", [built.archive, join(root, "host", "incoming", `42-1-${built.value.archiveSha256}.tar`)]);
  const stage = controller(host, "stage", built.value);
  assert.equal(stage.status, 0);
  assert.equal(stage.json.status, "staged");
  assert.equal(statSync(stage.json.pending.path).mode & 0o777, 0o755);
  assert.equal(statSync(join(stage.json.pending.path, "index.html")).mode & 0o777, 0o644);
  const active = controller(host, "activate", built.value, stage.json.generation);
  assert.equal(active.json.status, "active");
  assert.equal(
    readFileSync(join(host, "current", ".well-known", "vireo-deployment.json"), "utf8").includes(commit),
    true,
  );
  const firstRollback = controller(host, "rollback", built.value, active.json.generation);
  assert.equal(firstRollback.json.status, "rolled-back");
  assert.equal(readFileSync(join(host, "current", "index.html"), "utf8"), "legacy");
  execFileSync("cp", [built.archive, join(host, "incoming", `42-1-${built.value.archiveSha256}.tar`)]);
  const restaged = controller(host, "stage", built.value);
  const reactived = controller(host, "activate", built.value, restaged.json.generation);
  const accepted = controller(host, "accept", built.value, reactived.json.generation);
  assert.equal(accepted.json.status, "accepted");
  assert.equal(controller(host, "accept", built.value, accepted.json.generation).json.status, "accepted");
  const unchanged = bundle(root, "44");
  execFileSync("cp", [unchanged.archive, join(host, "incoming", `44-1-${unchanged.value.archiveSha256}.tar`)]);
  const unchangedStage = controller(host, "stage", unchanged.value);
  assert.equal(unchangedStage.json.status, "accepted");
  assert.equal(existsSync(join(host, "incoming", `44-1-${unchanged.value.archiveSha256}.tar`)), false);
  const stale = controller(host, "activate", built.value, 0);
  assert.equal(stale.status, 75);
  const second = bundle(root, "43", "changed home");
  execFileSync("cp", [second.archive, join(host, "incoming", `43-1-${second.value.archiveSha256}.tar`)]);
  const staged = controller(host, "stage", second.value);
  const activated = controller(host, "activate", second.value, staged.json.generation);
  const rolled = controller(host, "rollback", second.value, activated.json.generation);
  assert.equal(rolled.json.status, "rolled-back");
  assert.equal(
    readFileSync(join(host, "current", ".well-known", "vireo-deployment.json"), "utf8").includes(commit),
    true,
  );
});
test("controller rejects non-directory and link GNU tar root members", t => {
  if (spawnSync("tar", ["--version"], { encoding: "utf8" }).error?.code === "EPERM")
    return t.skip("sandbox forbids child-process archive tests; CI executes them");
  const root = mkdtempSync(join(tmpdir(), "vireo-site-cd-")),
    host = join(root, "host");
  mkdirSync(join(host, "incoming"), { recursive: true });
  for (const [kind, script] of [
    [
      "file",
      'import io,sys,tarfile;t=tarfile.open(sys.argv[1],"w");i=tarfile.TarInfo("./");i.size=1;t.addfile(i,io.BytesIO(b"x"));t.close()',
    ],
    [
      "link",
      'import sys,tarfile;t=tarfile.open(sys.argv[1],"w");i=tarfile.TarInfo("./");i.type=tarfile.SYMTYPE;i.linkname="target";t.addfile(i);t.close()',
    ],
  ]) {
    const archive = join(root, `${kind}.tar`);
    execFileSync("python3", ["-c", script, archive]);
    const archiveBytes = statSync(archive).size,
      archiveSha256 = createHash("sha256").update(readFileSync(archive)).digest("hex");
    const identity = {
      runId: kind === "file" ? "61" : "62",
      runAttempt: "1",
      repository: "vireocodedev/vireo",
      commit,
      archiveSha256,
      archiveBytes,
    };
    execFileSync("cp", [archive, join(host, "incoming", `${identity.runId}-1-${archiveSha256}.tar`)]);
    const result = controller(host, "stage", identity);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unsafe archive root member/u);
  }
});
test("deterministic PAX envelope ignores source timestamps and modes", t => {
  if (spawnSync("tar", ["--version"], { encoding: "utf8" }).error?.code === "EPERM")
    return t.skip("sandbox forbids child-process archive tests; CI executes them");
  const first = mkdtempSync(join(tmpdir(), "vireo-site-cd-")),
    second = mkdtempSync(join(tmpdir(), "vireo-site-cd-"));
  const one = bundle(first, "51"),
    two = bundle(second, "51");
  chmodSync(join(second, "artifact-51", "index.html"), 0o755);
  rmSync(join(second, "artifact-51", ".well-known"), { recursive: true });
  const threeArchive = join(second, "three.tar"),
    threeManifest = join(second, "three.json");
  const three = createWebsiteDeploymentBundle({
    artifactRoot: join(second, "artifact-51"),
    archivePath: threeArchive,
    manifestPath: threeManifest,
    repository: "vireocodedev/vireo",
    commit,
    runId: "51",
    runAttempt: "1",
  });
  assert.equal(one.value.archiveSha256, two.value.archiveSha256);
  assert.equal(one.value.archiveSha256, three.archiveSha256);
  assert.match(readFileSync("site/build-deployment-bundle.mjs", "utf8"), /delete=atime,delete=ctime/u);
  assert.match(readFileSync("site/build-deployment-bundle.mjs", "utf8"), /--mode=u=rwX,go=rX/u);
  assert.match(readFileSync("site/build-deployment-bundle.mjs", "utf8"), /chmodSync\(path, 0o644\)/u);
});
test("bundle and host controller reject links and mismatched repository proof", () => {
  const root = mkdtempSync(join(tmpdir(), "vireo-site-cd-"));
  const artifact = join(root, "artifact");
  mkdirSync(artifact);
  writeFileSync(join(artifact, "index.html"), "x");
  writeFileSync(join(artifact, "healthz"), "ok");
  symlinkSync("index.html", join(artifact, "link"));
  assert.throws(
    () =>
      createWebsiteDeploymentBundle({
        artifactRoot: artifact,
        archivePath: join(root, "x.tar"),
        manifestPath: join(root, "x.json"),
        repository: "vireocodedev/vireo",
        commit,
        runId: "1",
        runAttempt: "1",
      }),
    /regular files only/u,
  );
  rmSync(join(artifact, "link"));
  writeFileSync(join(artifact, "café.txt"), "x");
  assert.throws(
    () =>
      createWebsiteDeploymentBundle({
        artifactRoot: artifact,
        archivePath: join(root, "ascii.tar"),
        manifestPath: join(root, "ascii.json"),
        repository: "vireocodedev/vireo",
        commit,
        runId: "2",
        runAttempt: "1",
      }),
    /printable ASCII/u,
  );
  rmSync(join(artifact, "café.txt"));
  writeFileSync(join(artifact, "literal\\backslash.txt"), "x");
  assert.throws(
    () =>
      createWebsiteDeploymentBundle({
        artifactRoot: artifact,
        archivePath: join(root, "backslash.tar"),
        manifestPath: join(root, "backslash.json"),
        repository: "vireocodedev/vireo",
        commit,
        runId: "3",
        runAttempt: "1",
      }),
    /without backslashes/u,
  );
});

test("forced receiver and installer preserve their privilege and key boundaries", () => {
  const receiver = readFileSync("site/vireo-website-receiver.sh", "utf8");
  const controller = readFileSync("site/vireo-website-controller.py", "utf8");
  const installer = readFileSync("site/install-vps-cd.sh", "utf8");
  const workflow = readFileSync(".github/workflows/website.yml", "utf8");
  assert.match(receiver, /test "\$#" = 1/u);
  assert.match(receiver, /reconcile\) test "\$#" = 1/u);
  assert.match(receiver, /trap 'rm -f "\$tmp"' EXIT HUP INT TERM/u);
  assert.match(receiver, /flock -x 9/u);
  assert.match(receiver, /test \$\(\(used \+ bytes\)\) -le/u);
  assert.match(receiver, /-name '\*\.tmp\.\*'/u);
  assert.match(receiver, /! -name '.receiver\.lock' -printf '%s\\n'/u);
  assert.match(receiver, /upload\|stage\) test "\$#" = 7/u);
  assert.match(receiver, /activate\|accept\|rollback\) test "\$#" = 8/u);
  assert.match(receiver, /"\$verb" "\$run" "\$attempt" "\$repository" "\$commit" "\$digest" "\$bytes"/u);
  assert.doesNotMatch(receiver, /controller \$\{SSH_ORIGINAL_COMMAND\}/u);
  assert.ok(
    controller.indexOf("if verb=='accept' and content_same(s.get('current'),ident)") <
      controller.indexOf("if s['generation']!=int(args[6])"),
  );
  assert.ok(
    controller.indexOf("if verb=='rollback' and s.get('pending') is None") <
      controller.indexOf("if s['generation']!=int(args[6])"),
  );
  assert.match(controller, /current\.is_symlink\(\)/u);
  assert.match(controller, /"legacy":True/u);
  assert.match(controller, /VIREO_WEBSITE_CONTROL_ROOT/u);
  assert.match(controller, /release path must be a direct directory beneath releases/u);
  assert.match(controller, /control path must be a regular non-symlink file/u);
  assert.match(controller, /getattr\(os,'O_NOFOLLOW',0\)/u);
  assert.match(controller, /upload\.snapshot/u);
  assert.match(controller, /incoming archive has trailing bytes/u);
  assert.match(controller, /valid_orphan_target/u);
  assert.match(controller, /deployment path must be printable ASCII/u);
  assert.match(controller, /root controller refuses overridden production roots/u);
  assert.match(controller, /json\.dumps\(sorted\(entries\),separators=\(',',':'\)\)/u);
  assert.match(controller, /\(s\.get\('current'\) or \{\}\)\.get\('runId'\)/u);
  assert.match(installer, />> "\$auth"/u);
  assert.match(installer, /Existing website deployment key entry differs/u);
  assert.match(installer, /prior site configuration was restored/u);
  assert.match(installer, /cp -p "\$backup" "\$target"/u);
  assert.match(installer, /\/var\/lib\/vireo-website-deployment/u);
  assert.match(installer, /chown -R root:root "\$site_root\/releases"/u);
  assert.match(installer, /-m 0700 -o "\$user" -g "\$group" "\$site_root\/incoming"/u);
  assert.match(installer, /for directory in \/usr\/local\/libexec \/etc\/caddy \/etc\/caddy\/sites/u);
  assert.ok(installer.indexOf('if ! test -e "$site_root"') < installer.indexOf("for child in releases incoming"));
  assert.ok(
    installer.indexOf("for child in releases incoming") < installer.indexOf('chown -R root:root "$site_root/releases"'),
  );
  assert.match(installer, /getent passwd "\$user"/u);
  assert.match(installer, /test -L "\$ssh_dir"/u);
  assert.match(installer, /authorized_keys must be a real regular file/u);
  assert.match(installer, /runuser -u "\$user" -- sh -eu -c/u);
  assert.match(installer, /A malicious deployment user may change its own/u);
  assert.doesNotMatch(installer, /touch "\$auth"/u);
  assert.doesNotMatch(workflow, /\(\?:/u);
  assert.match(workflow, /grep -Eq '\^\(\[A-Za-z0-9\]/u);
  assert.equal((workflow.match(/git fetch --no-tags origin \+refs\/heads\/main/g) ?? []).length, 2);
  assert.ok(
    workflow.indexOf("trap rollback ERR INT TERM") <
      workflow.lastIndexOf("git fetch --no-tags origin +refs/heads/main:refs/remotes/origin/main"),
  );
});
