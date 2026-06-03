// Adds three checkbox toggles to the right-click menu of the extension icon:
//   - Hebrew font fix
//   - Left-drag pan (canvas)
//   - Finer wheel zoom (canvas)
// State is stored in chrome.storage.local and read by the content scripts.

// panFix defaults to OFF: Make shipped a native "Canvas panning: Left-click"
// setting (View > Preferences > Input device settings). With that on, our
// synthetic right-button pointerdown would trigger Make's multi-select (lasso)
// on every left-drag. Users who prefer our pan-fix can still enable it manually.
const DEFAULTS = { hebrewFix: true, panFix: false, zoomFix: true };

const MENU = {
    hebrewFix: { id: "toggle-hebrew", title: "Hebrew font fix" },
    panFix: { id: "toggle-pan", title: "Left-drag pan (canvas)" },
    zoomFix: { id: "toggle-zoom", title: "Finer wheel zoom (canvas)" },
};

async function buildMenu() {
    const state = await chrome.storage.local.get(DEFAULTS);
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: MENU.hebrewFix.id,
        title: MENU.hebrewFix.title,
        type: "checkbox",
        checked: state.hebrewFix,
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: MENU.panFix.id,
        title: MENU.panFix.title,
        type: "checkbox",
        checked: state.panFix,
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: MENU.zoomFix.id,
        title: MENU.zoomFix.title,
        type: "checkbox",
        checked: state.zoomFix,
        contexts: ["action"],
    });
}

const PAN_MIGRATION_FLAG = "panForcedOff_v2_6";

chrome.runtime.onInstalled.addListener(async (details) => {
    const cur = await chrome.storage.local.get([...Object.keys(DEFAULTS), PAN_MIGRATION_FLAG]);
    const init = {};
    for (const k of Object.keys(DEFAULTS)) {
        if (cur[k] === undefined) init[k] = DEFAULTS[k];
    }
    // One-time migration for existing installs: Make now ships a native canvas-pan
    // toggle, so force our pan-fix off once (otherwise it lasso-conflicts with the
    // native left-pan). Guarded by a flag so it runs a single time — users who
    // deliberately re-enable pan-fix afterwards keep their choice.
    if (details.reason === "update" && !cur[PAN_MIGRATION_FLAG]) {
        init.panFix = false;
        init[PAN_MIGRATION_FLAG] = true;
    }
    if (Object.keys(init).length) await chrome.storage.local.set(init);
    await buildMenu();
});

chrome.runtime.onStartup.addListener(buildMenu);

chrome.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId === MENU.hebrewFix.id) {
        await chrome.storage.local.set({ hebrewFix: info.checked });
    } else if (info.menuItemId === MENU.panFix.id) {
        await chrome.storage.local.set({ panFix: info.checked });
    } else if (info.menuItemId === MENU.zoomFix.id) {
        await chrome.storage.local.set({ zoomFix: info.checked });
    }
});
