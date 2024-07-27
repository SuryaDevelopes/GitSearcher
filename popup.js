document.addEventListener("DOMContentLoaded", () => {
  // Initialize the toggle button
  const toggleButton = document.getElementById('toggleButton');

  // Get the current state of the extension from storage
  chrome.storage.local.get('extensionActive', (data) => {
    if (data.extensionActive === false) {
      toggleButton.textContent = 'Turn On';
    } else {
      toggleButton.textContent = 'Turn Off';
    }
  });

  // Add click event listener to the toggle button
  toggleButton.addEventListener('click', () => {
    chrome.storage.local.get('extensionActive', (data) => {
      const newState = !data.extensionActive;
      chrome.storage.local.set({ extensionActive: newState }, () => {
        chrome.runtime.sendMessage({ action: 'toggleExtension', state: newState });
        toggleButton.textContent = newState ? 'Turn Off' : 'Turn On';
      });
    });
  });

  // Fetch and display gitHeadResults for the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.storage.local.get("gitHeadResults", (data) => {
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = ""; 

      if (data.gitHeadResults && data.gitHeadResults[tabId]) {
        const foundPaths = data.gitHeadResults[tabId];
        // console.log("under if");
        if (foundPaths.length > 0) {
          resultsDiv.innerHTML = "<h2>Found .git/HEAD at:</h2>";
          foundPaths.forEach(path => {
            const pathElement = document.createElement("div");
            pathElement.textContent = path;
            resultsDiv.appendChild(pathElement);
          });
        } else {
          console.log("Nothing Found!")
          resultsDiv.innerHTML = "<h2>Nothing found yet!</h2>";
        }
      }
    });
  });
});

