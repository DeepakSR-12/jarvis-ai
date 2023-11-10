document.addEventListener("DOMContentLoaded", () => {
  const optionsForm = document.getElementById("options-form");
  const apiKeyInput = document.getElementById("api-key");

  optionsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      alert("Please enter a valid API key.");
      return;
    }

    chrome.storage.sync.set({ apiKey }, () => {
      alert("API key saved!");
    });
  });

  chrome.storage.sync.get("apiKey", (data) => {
    const savedApiKey = data.apiKey;

    if (savedApiKey) {
      apiKeyInput.value = savedApiKey;
    }
  });
});
