# Job AutoFill - Chrome Extension

A browser extension built with Manifest V3 to securely autofill job applications from a stored user profile. This project was built to demonstrate proficiency in browser APIs, secure authentication, and DOM manipulation.

## Features

* **Secure Sign-In:** Authenticates users via Google OAuth 2.0 using the `chrome.identity` API.
* **Rich Profile Storage:** Saves a complex user profile (including name, contact info, experience, and education) to `chrome.storage.local`.
* **Smart Auto-fill:** The content script uses a heuristic engine to find and fill form fields.
* **Modern Architecture:** Built on Manifest V3 using an event-based Service Worker (`background.js`) for authentication and a popup UI (`popup.html`) for user interaction.
* **Robust Communication:** Uses `chrome.tabs.sendMessage` and `chrome.runtime.onMessage` to pass data between the popup, service worker, and the active web page.

## How to Test (Local Installation)

1.  **Download:** Click the green "Code" button on this repository's page and select **Download ZIP**.
2.  **Unzip:** Unzip the downloaded file (`job-autofill-repo-main.zip`) on your computer.
3.  **Open Chrome Extensions:** Open your Chrome browser and navigate to `chrome://extensions`.
4.  **Enable Developer Mode:** Find the **"Developer mode"** toggle in the top-right corner and turn it on.
5.  **Load the Extension:** Click the **"Load unpacked"** button that appeared on the left. Select the unzipped folder (the one that directly contains the `manifest.json` file).

The "Job AutoFill" icon will now appear in your Chrome toolbar, ready for testing.
