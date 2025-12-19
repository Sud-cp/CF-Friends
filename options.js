const textarea = document.getElementById("handles");
const status = document.getElementById("status");

chrome.storage.sync.get("friends", (data) => {
  if (data.friends) {
    textarea.value = data.friends.join("\n");
  }
});

document.getElementById("save").onclick = () => {
  const handles = textarea.value
    .split("\n")
    .map(h => h.trim())
    .filter(h => h.length > 0);

  chrome.storage.sync.set({ friends: handles }, () => {
    status.textContent = "Saved!";
    setTimeout(() => status.textContent = "", 1500);
  });
};
