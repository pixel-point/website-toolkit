const prompt = document.querySelector("#setup-prompt");
function selectHost(host) {
  document.querySelector("#copy-status").textContent =
    "Paste this into a chat opened in your website project.";
  for (const button of document.querySelectorAll("[data-host]"))
    button.setAttribute("aria-pressed", String(button.dataset.host === host));
  document.querySelector("#host-label").textContent = host;
  prompt.value = `Set up Website Toolkit for me in ${host} from https://github.com/pixel-point/website-toolkit.\n\nRead the README and setup instructions. Check my runtime, host CLI and existing website checkout. Install Website Toolkit and any missing SiteOS, Prime and Sanity plugins independently, plus the required CLIs. Let the official Sanity plugin provide its MCP connection and skills. If this website uses Vercel, also find and install the official Vercel plugin through the host catalog and complete its authorization. Reuse existing connections; do not add duplicate MCP servers. Check Vercel CLI sign-in separately and export Development settings directly into a private Git-ignored local file. Preserve existing values and keep secrets out of chat and tool responses. Preserve working settings. Read the website project instructions and verify its domain, components and provider context.\n\nGuide me through sign-in to Sanity, SiteOS and Prime, select the existing website projects, and verify access. If a reload is needed, save progress and give me one resume prompt.\n\nDo not publish content, deploy code, create replacement projects or run paid checks during setup. Tell me what is ready and what remains.`;
}
async function copy(text, status, fallback) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Copied. Paste it into your AI conversation.";
  } catch {
    if (fallback) {
      fallback.focus();
      fallback.select();
    }
    status.textContent =
      "Select and copy the prompt, then paste it into your AI conversation.";
  }
}
for (const button of document.querySelectorAll("[data-host]"))
  button.addEventListener("click", () => selectHost(button.dataset.host));
document
  .querySelector("#copy-setup")
  .addEventListener("click", () =>
    copy(prompt.value, document.querySelector("#copy-status"), prompt),
  );
for (const button of document.querySelectorAll(".copy-example"))
  button.addEventListener("click", () =>
    copy(
      button.closest("article").querySelector("p").textContent,
      document.querySelector("#example-status"),
    ),
  );
selectHost("Codex");
