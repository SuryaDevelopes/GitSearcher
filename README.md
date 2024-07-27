# Git Searcher Browser Extension

This Chrome extension automatically searches for `.git/HEAD` files in all possible directory endpoints found within the source code of any visited website. If a `.git/HEAD` file is found, it displays the result in the extension popup.

## Features

- **Automated Search**: Extracts all unique paths from the webpage source code and checks each for the presence of a `.git/HEAD` file.
- **Validation**: Verifies the presence of a valid `.git/HEAD` file by checking if the response length is less than 100 bytes and contains the string `/refs/heads`.
- **Notifications**: Displays the found results in the extension popup.
- **Toggle On/Off**: Allows users to enable or disable the extension via a button.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top-right corner.
4. Click on the "Load unpacked" button and select the directory containing the extension files.

## Usage

1. Ensure the extension is enabled.
2. Visit any website. The extension will automatically search for `.git/HEAD` files in various directory paths found in the webpage's source code.
3. Click on the extension icon to view the results if any `.git/HEAD` file is found.

## Development

### Folder Structure

- `manifest.json`: The manifest file that contains the extension's metadata.
- `background.js`: The background script that handles the automated search and validation.
- `content.js`: The content script that extracts paths from the webpage source code.
- `popup.html`: The HTML file for the extension popup.
- `popup.js`: The JavaScript file for the extension popup.
- `styles.css`: The CSS file for styling the extension popup.

## Special Thanks

- UI Done by Mohit Singh.



Hope this helps in your hacking journey!,

:heart: from Surya!
