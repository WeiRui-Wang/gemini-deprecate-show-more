# Chrome Extension Release Workflow

Documentation for the GitHub Actions workflow located at `.github/workflows/manual-release.yml`. The workflow automates packaging the "Gemini Auto Expander" Chrome extension, creating a GitHub Release, and uploading the extension ZIP file.

## Overview

The workflow is manually triggered for controlled releases. Upon triggering, automated steps include:

1.  **Code Checkout**: Fetches the specified repository branch.
2.  **Environment Setup**: Optionally configures Node.js.
3.  **Version & Tag Determination**:
    * Uses provided `version` input or version from `manifest.json` for release version.
    * Constructs a Git tag (e.g., `v1.2.3`) from the version.
4.  **Extension Packaging**:
    * Creates a temporary build directory (`release_build`).
    * Copies `manifest.json` to build directory root.
    * Copies specified logo (`images/icon_inactive_128.png`) to build directory root as `128.png`.
    * Copies core extension files (`background.js`, `content_script.js`, `popup.html`, `popup.js`).
    * Copies entire `images/` directory.
5.  **ZIP File Creation**: Archives packaged files into a ZIP file (e.g., `gemini-auto-expander-v1.2.3.zip`).
6.  **GitHub Release Creation**: Employs `actions/create-release@v1` to generate a new GitHub repository release, associated with the determined tag.
7.  **Release Asset Upload**: Uploads the generated ZIP file to the new GitHub Release via `actions/upload-release-asset@v1`.
8.  **Workflow Artifact Upload (Optional)**: Uploads the ZIP file as a general workflow artifact.

## Usage Instructions

The workflow requires manual triggering:

1.  Navigate to repository "Actions" tab.
2.  Select "Manual Extension Release with GitHub Release" from left sidebar.
3.  Click "Run workflow" button.
4.  Provide values for the following inputs:
    * **Version (`version`)**: (Optional) Specify release version (e.g., `1.2.4`). Used for Git tag (prefixed 'v' if absent, e.g., `v1.2.4`). If empty, version from `manifest.json` forms the tag.
    * **Branch to build from (`branchName`)**: (Required) Branch name for checkout and build. Defaults to `master`.
    * **Notes for this release (`releaseNotes`)**: (Optional) Custom release notes for GitHub Release page. Defaults to "Bug fixes and improvements."
    * **Mark this as a pre-release? (`isPreRelease`)**: (Required) Select `true` or `false` from dropdown to indicate pre-release status. Defaults to `false`.
5.  Click "Run workflow" button in dialog to initiate.

Upon completion, a new Release appears on repository "Releases" page, with packaged extension ZIP file attached.

## Configuration (Environment Variables)

Workflow configuration uses environment variables defined in `.github/workflows/manual-release.yml`. Modify these if file structure or naming conventions change:

* `RELEASE_DIR`: Temporary directory for package building (default: `release_build`).
* `MANIFEST_FILE`: Manifest file name (default: `manifest.json`).
* `LOGO_SOURCE_PATH`: Source 128px logo file path (default: `images/icon_inactive_128.png`).
* `LOGO_DEST_NAME`: Destination logo name in ZIP root (default: `128.png`).
* `IMAGES_DIR_SOURCE`: Source images directory name in repository (default: `images`).
* `IMAGES_DIR_DEST`: Images directory name within ZIP file (default: `images`).
* `CORE_FILES_TO_COPY`: Multi-line string listing core JS and HTML files for copying.
* `ZIP_FILE_NAME_PREFIX`: Output ZIP file prefix (default: `gemini-auto-expander`).

## Customization

* **Automatic Triggers**: For fully automatic releases (e.g., on Git tag push), modify workflow `on:` section. Example for `v1.2.3` tags:
    ```yaml
    on:
      push:
        tags:
          - 'v[0-9]+.[0-9]+.[0-9]+*'
    ```
  With tag-based triggers, `version` and `tag_name` are typically derived from `github.ref_name`.
* **Store Publishing**: Automating Chrome Web Store uploads requires additional steps, tools (e.g., `chrome-webstore-upload-cli`), and secure API key secret management.
