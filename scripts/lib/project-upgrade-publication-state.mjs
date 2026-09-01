const TEMPLATE_COMMIT_PENDING_RELEASE = "TEMPLATE_COMMIT_PENDING_RELEASE";

function isImmutableCommit(value) {
  return /^[a-f0-9]{40}$/u.test(value ?? "");
}

function fail(message) {
  throw new Error(`Project-upgrade release state: ${message}`);
}

/**
 * A merge may carry an explicit, non-publishable upgrade candidate while the
 * Template release is being finalized. Publication is a stricter boundary:
 * it accepts only a terminal public node with an immutable Template commit.
 */
export function assertPackableProjectUpgrade(projectUpgrade, upgradePolicy, mode = "merge") {
  if (!new Set(["merge", "publication"]).has(mode)) {
    fail(`unsupported pack mode ${JSON.stringify(mode)}`);
  }
  const graph = upgradePolicy?.releaseGraph;
  if (upgradePolicy?.schemaVersion !== 2 || !graph || !Array.isArray(graph.releases) || !Array.isArray(graph.edges)) {
    fail("packed create-vireo policy must declare a release graph");
  }
  const nodes = new Map(graph.releases.map(node => [node.release, node]));
  const publicNode = nodes.get(graph.publicRelease);
  if (publicNode?.status !== "current" || !isImmutableCommit(publicNode.templateCommit)) {
    fail("packed policy must retain an immutable public current node");
  }
  const targetRelease = graph.candidateRelease ?? graph.publicRelease;
  const target = nodes.get(targetRelease);
  if (!target || !graph.edges.some(edge => edge.from === graph.previousRelease && edge.to === targetRelease)) {
    fail("packed policy must retain the adjacent prior-current edge");
  }

  if (graph.candidateRelease !== undefined) {
    const candidateTemplateCommit = target.templateCommit;
    if (
      projectUpgrade?.publicationState !== "candidate" ||
      projectUpgrade?.candidateRelease !== graph.candidateRelease ||
      projectUpgrade?.publicRelease !== graph.publicRelease ||
      projectUpgrade?.previousRelease !== graph.previousRelease ||
      target.status !== "candidate" ||
      candidateTemplateCommit !== projectUpgrade?.finalization?.targetTemplateCommit ||
      (candidateTemplateCommit !== TEMPLATE_COMMIT_PENDING_RELEASE &&
        (!isImmutableCommit(candidateTemplateCommit) || candidateTemplateCommit === publicNode.templateCommit))
    ) {
      fail("candidate state must retain matching pending or distinct immutable Template finalization");
    }
    if (mode === "publication") {
      fail("create-vireo cannot be packed for publication while the project-upgrade release is a candidate");
    }
    return { state: "candidate", targetRelease };
  }

  if (
    projectUpgrade?.publicationState !== "final" ||
    projectUpgrade?.candidateRelease !== undefined ||
    projectUpgrade?.publicRelease !== graph.publicRelease ||
    projectUpgrade?.previousRelease !== graph.previousRelease ||
    target !== publicNode ||
    target.status !== "current" ||
    !isImmutableCommit(target.templateCommit) ||
    target.templateCommit === nodes.get(graph.previousRelease)?.templateCommit
  ) {
    fail("publication requires a final terminal current node with a distinct immutable Template commit");
  }
  return { state: "final", targetRelease };
}
