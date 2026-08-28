const copyButton = document.querySelector("[data-copy-command]");
const copyStatus = document.querySelector("[data-copy-status]");

copyButton?.addEventListener("click", async () => {
  const command = copyButton.getAttribute("data-copy-command") ?? "";

  try {
    await navigator.clipboard.writeText(command);
    copyButton.textContent = "Copied";
    if (copyStatus) copyStatus.textContent = "Create command copied to the clipboard.";
  } catch {
    copyButton.textContent = "Select command";
    if (copyStatus) copyStatus.textContent = "Clipboard access was unavailable; select and copy the command.";
  }
});

const releaseSelect = document.querySelector("[data-release-select]");

releaseSelect?.addEventListener("change", event => {
  if (!(event.currentTarget instanceof HTMLSelectElement)) return;
  const destination = event.currentTarget.value;
  if (destination) window.location.assign(destination);
});
