// popup.js
// Manages the UI and logic for the extension's popup (popup.html).

document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('enableAutoExpandToggle');

    if (!toggleSwitch) {
        console.error("Popup: Toggle switch ('enableAutoExpandToggle') not found in popup.html.");
        return;
    }

    // Load initial state from storage and set the toggle's visual state.
    chrome.storage.local.get('isEnabled', (data) => {
        const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true; // Default to enabled.
        toggleSwitch.checked = isEnabled;
        console.log('Popup: Initial auto-expand state loaded from storage:', isEnabled);
    });

    // Listen for changes to the toggle switch.
    toggleSwitch.addEventListener('change', (event) => {
        const newIsEnabledState = event.target.checked;
        // Save new state to storage. background.js listens for this change.
        chrome.storage.local.set({ isEnabled: newIsEnabledState }, () => {
            console.log('Popup: Auto-expand state saved to storage:', newIsEnabledState);
        });
    });
});
