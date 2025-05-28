# Gemini Auto Expander Chrome Extension

The "Gemini Auto Expander" is a browser extension for Google Chrome designed to enhance user experience on Gemini by automatically expanding content sections.

## Features

* **Automatic Content Expansion**: Automated clicking of "show more" buttons on [Gemini](https://gemini.google.com/). Content is expanded by default for a smoother reading experience.
* **Toggle Functionality**: Users can enable or disable the auto-expansion feature via the extension's popup icon in the Chrome toolbar.
* **State Persistence**: The enabled/disabled state of the extension is saved locally, so user preference is remembered across browser sessions.

## Installation

Currently, this extension is not published on the Chrome Web Store. To install and use "Gemini Auto Expander":

1.  **Download the Extension Package**:
    * Obtain the latest release ZIP file (e.g., `gemini-auto-expander-vX.Y.Z.zip`) from the [Releases page](https://github.com/WeiRui-Wang/gemini-deprecate-show-more/releases) of this repository.
    * Extract the contents of the ZIP file to a local directory on your computer. You should see files like `manifest.json`, `128.png`, script files, and an `images` folder.

2.  **Load in Chrome**:
    * Open Google Chrome.
    * Navigate to `chrome://extensions` in the address bar.
    * Ensure "Developer mode" (usually a toggle in the top-right corner) is **enabled**.
    * Click the "Load unpacked" button.
    * In the file dialog, select the local directory where you extracted the extension files.
    * The "Gemini Auto Expander" extension should now appear in your list of installed extensions and be active.

## Usage

Once installed:

* **Automatic Expansion**: Navigate to any Gemini interface (e.g., `*://gemini.google.com/*`). Content sections that typically require a "show more" click should now be automatically expanded.
* **Toggle On/Off**:
    * Click the "Gemini Auto Expander" icon in your Chrome toolbar (it should be an icon with active/inactive states).
    * A popup will appear with a toggle switch labeled "Enable Auto-Expand".
    * Use this switch to turn the auto-expansion functionality on or off. Your preference will be saved.

## Files Overview

The extension consists of the following key files:

* `manifest.json`: Defines the extension's properties, permissions, and core components.
* `background.js`: Service worker managing state, icon updates, and communication with content scripts.
* `content_script.js`: Injected into Gemini interface to handle the logic for finding and interacting with "show more" elements.
* `popup.html` & `popup.js`: Define the structure and logic for the extension's popup interface.
* `images/`: Contains icons used by the extension.
* `128.png`: The primary 128x128 icon for the extension (as referenced in `manifest.json` to be located in the `images` folder).

## Development & Release Process

### Building the Extension

No specific build steps are required for development beyond having the source files. The extension can be loaded unpacked as described in the Installation section.

### Automated Release Packaging

A GitHub Actions workflow (`.github/workflows/manual-release.yml`) is configured to automate the packaging of the extension for release.

**Workflow Overview:**

The workflow is manually triggered and performs the following:

1.  **Code Checkout**: Fetches the specified repository branch.
2.  **Version & Tag Determination**: Uses provided input or version from `manifest.json` for release version and Git tag.
3.  **Extension Packaging**:
    * Copies `manifest.json`, `128.png` (from `images/icon_inactive_128.png`), core scripts (`background.js`, `content_script.js`, `popup.html`, `popup.js`), and the `images/` directory into a structured build folder.
4.  **ZIP File Creation**: Archives packaged files into a versioned ZIP file (e.g., `gemini-auto-expander-v1.2.3.zip`).
5.  **GitHub Release Creation**: Generates a new GitHub Release associated with the determined tag.
6.  **Release Asset Upload**: Uploads the generated ZIP file to the GitHub Release.

**Triggering a Release (Manual):**

1.  Navigate to repository "Actions" tab.
2.  Select "Manual Extension Release with GitHub Release".
3.  Click "Run workflow" and provide inputs for version, branch, release notes, and pre-release status.

Refer to the [workflow's README](.github/workflows/README.md) for more detailed information on the release workflow configuration and customization if such a file exists.
