// content_script.js for Gemini Auto Expander
// Injected into Gemini pages to manage "show more" buttons based on extension state.

let observer = null; // MutationObserver instance.
let currentIsEnabled = false; // Local cache of the extension's enabled state.
let originalButtonReference = null; // Stores a reference to the button acted upon for reverting.

// Processes the "Show more/less" button based on its current state and extension's enabled status.
function processAndHideButton() {
  if (!currentIsEnabled) return 'disabled';

  const button = document.querySelector('button[data-test-id="show-more-button"]');
  if (!button) return 'not_found';

  if (originalButtonReference === button && button.style.display === 'none') return 'action_taken_and_hidden'; // Already handled.

  console.log("ContentScript: 'show-more-button' found on page.");
  try {
    const expandMoreIcon = button.querySelector('mat-icon[data-mat-icon-name="expand_more"]');
    const expandLessIcon = button.querySelector('mat-icon[data-mat-icon-name="expand_less"]');

    if (expandMoreIcon) {
      console.log("ContentScript: Button is 'expand_more'. Clicking to expand then hiding.");
      button.click();
    } else if (expandLessIcon) {
      console.log("ContentScript: Button is 'expand_less'. Only hiding.");
    } else {
      console.log("ContentScript: Button icon state indeterminate. Hiding.");
    }

    originalButtonReference = button;
    originalButtonReference.style.display = 'none';
    console.log("ContentScript: Button hidden and reference stored.");
    return 'action_taken_and_hidden';

  } catch (error) {
    console.error("ContentScript: Error interacting with the button:", error);
    return 'error';
  }
}

// Reverts the action by making the stored button visible again.
function revertAndShowButton() {
  if (originalButtonReference) {
    console.log("ContentScript: Reverting action. Making button visible.");
    try {
      originalButtonReference.style.display = ''; // Restore original display.
      originalButtonReference = null; // Clear the reference.
      return true;
    } catch (error) {
      console.error("ContentScript: Error reverting and showing button:", error);
      if (document.body.contains(originalButtonReference)) {
        originalButtonReference.style.display = '';
      }
      originalButtonReference = null;
      return false;
    }
  }
  return false;
}

// Sets up or tears down the MutationObserver and handles immediate button processing.
function setupObserver(enable) {
  currentIsEnabled = enable;

  if (enable) {
    console.log("ContentScript: Enabling observer and attempting initial action.");
    const actionResult = processAndHideButton();

    if (actionResult === 'action_taken_and_hidden' || actionResult === 'found_already_expanded') {
      console.log("ContentScript: Initial button action conclusive. Result:", actionResult);
      if (observer) {
        observer.disconnect();
        console.log("ContentScript: Observer disconnected after initial action/check.");
      }
      return;
    }

    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true });
      console.log("ContentScript: Observer re-activated.");
    } else {
      observer = new MutationObserver((mutationsList, obsInstance) => {
        if (!currentIsEnabled) return;

        const mutationActionResult = processAndHideButton();
        if (mutationActionResult === 'action_taken_and_hidden' || mutationActionResult === 'found_already_expanded') {
          console.log("ContentScript: Button action conclusive via Mutation. Result:", mutationActionResult);
          obsInstance.disconnect();
          console.log("ContentScript: Observer disconnected via mutation.");
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      console.log("ContentScript: Observer started.");
    }
  } else { // Extension is being disabled.
    console.log("ContentScript: Disabling observer and attempting revert.");
    if (observer) {
      observer.disconnect();
      console.log("ContentScript: Observer stopped due to extension being disabled.");
    }
    revertAndShowButton();
  }
}

// Listens for messages from the background script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "stateChange") {
    console.log(`ContentScript: Received stateChange (Source: ${message.source}) - isEnabled: ${message.isEnabled}`);
    setupObserver(message.isEnabled);
    sendResponse({status: "State received and processed by content script"});
    return true;
  }
});

// Initial state check when the content script is first injected.
(async () => {
  try {
    const data = await chrome.storage.local.get("isEnabled");
    const initialState = data.isEnabled !== undefined ? data.isEnabled : true;
    console.log("ContentScript: Initial state loaded - isEnabled:", initialState);
    setupObserver(initialState);
  } catch (e) {
    console.error("ContentScript: Error loading initial state from storage:", e);
  }
})();

console.log("ContentScript: Loaded and initialized.");
