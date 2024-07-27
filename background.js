const gitHeadResults = {};
let extensionActive = true; // Initial state

// Function to update the extension state
function updateExtensionState(active) {
  extensionActive = active;
  if (active) {
    chrome.action.setIcon({ path: "images/icon-128.png" });
    chrome.action.setBadgeText({ text: "ON" });
  } else {
    chrome.action.setIcon({ path: "images/icon-128-inactive.png" });
    chrome.action.setBadgeText({ text: "OFF" });
  }
  chrome.storage.local.set({ extensionActive: active });
}

// Listen for messages to toggle the extension state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleExtension') {
    updateExtensionState(message.state);
  }
});

// Update state when the extension is loaded
chrome.storage.local.get("extensionActive", (data) => {
  if (data.extensionActive !== undefined) {
    extensionActive = data.extensionActive;
  }
  updateExtensionState(extensionActive);
});

// Listen for messages and handle storing results
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!extensionActive) return;

  if (message.action === "storeResult" && sender.tab) {
    const tabId = sender.tab.id;
    if (!gitHeadResults[tabId]) {
      gitHeadResults[tabId] = [];
    }
    // Merge and deduplicate results
    gitHeadResults[tabId] = [...new Set([...gitHeadResults[tabId], ...message.data])];
    chrome.storage.local.set({ gitHeadResults });

    if (message.data.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon-128.png',
        title: 'Git Head Found',
        message: `Found .git/HEAD at: ${message.data.join(', ')}`
      });
    }
  }
});

// Clean up results when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (!extensionActive) return;
  delete gitHeadResults[tabId];
  chrome.storage.local.set({ gitHeadResults });
});

// Show results when a tab is activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!extensionActive) return;

  const tabId = activeInfo.tabId;
  chrome.storage.local.get("gitHeadResults", (data) => {
    if (data.gitHeadResults && data.gitHeadResults[tabId]) {
      chrome.tabs.sendMessage(tabId, { action: "showResult", data: data.gitHeadResults[tabId] });
    }
  });
});

// Inject content script when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!extensionActive) return;

  if (changeInfo.status === "complete") {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    });
  }
});

