const getStorageData = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (data) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data[key]);
      }
    });
  });
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "getKeys") {
    try {
      const apiKey = await getStorageData("apiKey");
      sendResponse({ apiKey });
    } catch (error) {
      sendResponse({ error: "Failed to fetch apiKey" });
    }
    return true;
  }
});
