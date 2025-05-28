// background.js
// Service worker for Gemini Auto Expander: manages state, icons, and content script communication.

// Defines paths to static icon image files for toolbar icon updates.
const iconPaths = {
    active: {
        "16": "images/icon_active_16.png",
        "32": "images/icon_active_32.png",
        "48": "images/icon_active_48.png",
        "128": "images/icon_active_128.png"
    },
    inactive: {
        "16": "images/icon_inactive_16.png",
        "32": "images/icon_inactive_32.png",
        "48": "images/icon_inactive_48.png",
        "128": "images/icon_inactive_128.png"
    }
};

// Updates the extension's toolbar icon and tooltip based on the 'isEnabled' state.
async function updateActionAppearance(isEnabled) {
    const stateKey = isEnabled ? "active" : "inactive";
    const title = `Gemini Auto Expander (${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)})`;

    try {
        if (chrome.action && chrome.action.setIcon) {
            await chrome.action.setIcon({ path: iconPaths[stateKey] });
            await chrome.action.setTitle({ title: title });
            console.log("Background: Action appearance updated for state:", stateKey);
        } else {
            console.warn("Background: chrome.action API not available to set icon/title.");
        }
    } catch (error) {
        console.error("Background: Error updating action appearance:", error);
    }
}

// Notifies the content script in a Gemini tab about state changes.
async function notifyGeminiTab(tabId, isEnabledState, reason = "unknown-trigger") {
    try {
        if (tabId && tabId !== chrome.tabs.TAB_ID_NONE) { // Ensure tabId is valid.
            const tab = await chrome.tabs.get(tabId); // Verify tab existence.
            if (tab && tab.url && tab.url.startsWith("https://gemini.google.com/")) { // Check if it's a Gemini page.
                console.log(`Background: Notifying Gemini tab ${tabId} (Reason: ${reason}) of state: ${isEnabledState}. URL: ${tab.url}`);
                chrome.tabs.sendMessage(tabId, {
                    action: "stateChange",
                    isEnabled: isEnabledState,
                    source: `background-${reason}` // Provide context.
                }).catch(error => {
                    // Suppress common errors if content script isn't ready or tab is closed.
                    if (!error.message.includes("Could not establish connection") && !error.message.includes("Receiving end does not exist")) {
                        console.warn(`Background: Could not send message to tab ${tabId}:`, error.message);
                    }
                });
            }
        }
    } catch (error) {
        // Suppress error if tab no longer exists.
        if (!error.message.toLowerCase().includes("no tab with id")) {
            console.warn(`Background: Error processing tab ${tabId} for notification (Reason: ${reason}):`, error.message);
        }
    }
}

// Initializes extension state on installation or update.
chrome.runtime.onInstalled.addListener(async (details) => {
    const { reason } = details;
    (async () => { // IIFE for async operations.
        try {
            const data = await chrome.storage.local.get("isEnabled");
            const initialState = data.isEnabled !== undefined ? data.isEnabled : true; // Default to 'enabled'.
            await chrome.storage.local.set({ isEnabled: initialState });
            await updateActionAppearance(initialState);
            console.log("Background: Initialized. State set to", initialState, "(Reason:", reason + ")");
        } catch (e) {
            console.error("Background: Error during onInstalled event:", e);
        }
    })();
});

// Listens for changes in chrome.storage.local, typically from the popup.
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'local' && changes.isEnabled) {
        const newIsEnabledState = changes.isEnabled.newValue;
        console.log("Background: 'isEnabled' state changed in storage to:", newIsEnabledState);
        await updateActionAppearance(newIsEnabledState);

        try { // Notify all relevant Gemini tabs.
            const tabs = await chrome.tabs.query({ url: "*://gemini.google.com/*" });
            tabs.forEach(activeTab => {
                if (activeTab.id) {
                    notifyGeminiTab(activeTab.id, newIsEnabledState, "storageChange");
                }
            });
        } catch (e) {
            console.error("Background: Error querying/notifying tabs during storage.onChanged:", e);
        }
    }
});

// Ensures correct icon state on browser startup.
chrome.runtime.onStartup.addListener(async () => {
    try {
        const data = await chrome.storage.local.get("isEnabled");
        const currentState = data.isEnabled !== undefined ? data.isEnabled : true;
        await updateActionAppearance(currentState);
        console.log("Background: Startup state check. State is:", currentState);
    } catch (e) {
        console.error("Background: Error during onStartup event:", e);
    }
});

// Listens for tab updates (page loads, navigations).
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const currentTabUrl = changeInfo.url || (tab && tab.url);

    if (currentTabUrl && currentTabUrl.startsWith("https://gemini.google.com/")) {
        // Notify when a Gemini page finishes loading or URL changes to Gemini.
        if (changeInfo.status === 'complete' || (changeInfo.url && changeInfo.url.startsWith("https://gemini.google.com/"))) {
            console.log(`Background: Tab updated event. TabId: ${tabId}, Status: ${changeInfo.status}, URL: ${currentTabUrl}`);
            const data = await chrome.storage.local.get("isEnabled");
            const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
            await notifyGeminiTab(tabId, isEnabled, "tabUpdated");
        }
    }
});
