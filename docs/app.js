const prompt = document.querySelector("#setup-prompt");
function selectHost(host) {
  document.querySelector("#copy-status").textContent =
    "Paste this into a chat opened in your website project.";
  for (const button of document.querySelectorAll("[data-host]"))
    button.setAttribute("aria-pressed", String(button.dataset.host === host));
  document.querySelector("#host-label").textContent = host;
  prompt.value = `Set up Website Toolkit for me in ${host} from https://github.com/pixel-point/website-toolkit.\n\nFor GitHub-hosted websites, first connect the official GitHub plugin through the host catalog. Prepare missing Git and GitHub CLI tools, guide supported browser sign-in, verify repository access and local Git authentication, and download the website for me. Reuse working connections and preserve existing files. Handle commands for me; do not ask me to create tokens or configure SSH. Explain only required confirmations and missing invitations. Read the README and setup instructions. Check my runtime, host CLI and existing website checkout. During this full setup, install or refresh Website Toolkit, SiteOS, Prime and Sanity independently from their official sources. Resolve the CLIs latest stable releases, compare actual installed versions, check the executables and required commands, then follow the updated provider instructions. Preserve deliberate pins for an explicit decision. Let the official Sanity plugin provide its MCP connection and skills. If this website uses Vercel, also find and install the official Vercel plugin through the host catalog and complete its authorization. Reuse existing connections; do not add duplicate MCP servers. Check Vercel CLI sign-in separately and export Development settings directly into a private Git-ignored local file. Preserve existing values and keep secrets out of chat and tool responses. Preserve working settings. Read the website project instructions and verify its domain, components and provider context.\n\nComplete Sanity, SiteOS and Prime connections as required parts of full setup. Follow their current installed instructions. For Prime use browser approval, keep the command running while I approve and resume afterwards; do not use the old emailed Terminal command. Verify SiteOS CLI and MCP independently against the same website target. Keep a checklist of verified and pending connections. If a reload is needed, save non-secret targets and pending items in one resume prompt. A working preview or successful doctor result does not waive missing connections. Mark setup complete only after every required connection has a successful project read and the local preview works; otherwise say setup is incomplete and guide the next action.\n\nDo not publish content, deploy code, create replacement projects or run paid checks during setup. Tell me what is ready and what remains.`;
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
