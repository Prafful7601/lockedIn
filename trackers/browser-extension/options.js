const input = document.getElementById("endpoint");
const status = document.getElementById("status");

chrome.storage.sync.get("endpoint").then(({ endpoint }) => {
  input.value = endpoint || "http://localhost:3000/api/track";
});

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.sync.set({ endpoint: input.value.trim() });
  status.textContent = "Saved ✓";
  setTimeout(() => (status.textContent = ""), 1500);
});
