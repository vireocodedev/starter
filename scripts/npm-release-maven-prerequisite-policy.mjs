const prerequisiteName = "Verify current Maven artifacts are public before npm publication";
const prerequisiteRun =
  './jvm/scripts/verify-central-consumer.sh "$(node scripts/current-ecosystem-maven-version.mjs)"';
const releaseGateRun = "corepack npm run gate:release";

function jobLines(workflow, name) {
  const lines = workflow.split(/\r?\n/u);
  const start = lines.findIndex(line => line === `  ${name}:`);
  if (start < 0) return [];
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^ {2}[A-Za-z0-9_-]+:\s*$/u.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end);
}

function steps(job) {
  const result = [];
  for (let index = 0; index < job.length; index += 1) {
    if (!job[index].startsWith("      - ")) continue;
    let end = job.length;
    for (let cursor = index + 1; cursor < job.length; cursor += 1) {
      if (job[cursor].startsWith("      - ")) {
        end = cursor;
        break;
      }
    }
    result.push({ start: index, lines: job.slice(index, end) });
    index = end - 1;
  }
  return result;
}

export function validateNpmReleaseMavenPrerequisite(workflow) {
  const problems = [];
  const verify = jobLines(workflow, "verify");
  const publish = jobLines(workflow, "publish");

  if (verify.length === 0) problems.push("release-npm.yml must retain the verify job before publication.");
  if (verify.some(line => /^ {4}continue-on-error:/u.test(line))) {
    problems.push("release-npm.yml:verify may not continue on error at job level.");
  }
  const prerequisiteSteps = steps(verify).filter(step => step.lines[0] === `      - name: ${prerequisiteName}`);
  if (prerequisiteSteps.length !== 1) {
    problems.push("release-npm.yml:verify must contain exactly one named Maven public-availability prerequisite step.");
  } else {
    const [step] = prerequisiteSteps;
    if (
      step.lines.length !== 2 ||
      step.lines[1] !== `        run: ${prerequisiteRun}` ||
      step.lines.some(line => /^ {8}(?:if|continue-on-error):/u.test(line))
    ) {
      problems.push(
        "release-npm.yml:verify Maven prerequisite must be an unconditional exact single-line anonymous verification command.",
      );
    }
    const gate = steps(verify).find(
      step => step.lines.length === 1 && step.lines[0] === `      - run: ${releaseGateRun}`,
    );
    if (!gate || step.start >= gate.start) {
      problems.push("release-npm.yml:verify must prove Maven Central availability before the npm release gate.");
    }
  }

  if (publish.filter(line => line === "    needs: [plan, verify]").length !== 1) {
    problems.push("release-npm.yml:publish must require the authorized plan and successful verify.");
  }
  if (publish.filter(line => /^ {4}needs:/u.test(line)).length !== 1) {
    problems.push("release-npm.yml:publish must declare exactly one needs dependency.");
  }
  if (
    publish.filter(line => /^ {4}if:/u.test(line)).length !== 1 ||
    !publish.includes("    if: needs.verify.result == 'success'")
  ) {
    problems.push("release-npm.yml:publish must retain the scoped success-gated publish condition.");
  }
  return problems;
}
