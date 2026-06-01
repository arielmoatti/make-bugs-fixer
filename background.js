// Adds three checkbox toggles to the right-click menu of the extension icon:
//   - Hebrew font fix
//   - Left-drag pan (canvas)
//   - Finer wheel zoom (canvas)
// State is stored in chrome.storage.local and read by the content scripts.

const DEFAULTS = { hebrewFix: true, panFix: true, zoomFix: true };

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

chrome.runtime.onInstalled.addListener(async () => {
    const cur = await chrome.storage.local.get(Object.keys(DEFAULTS));
    const init = {};
    for (const k of Object.keys(DEFAULTS)) {
        if (cur[k] === undefined) init[k] = DEFAULTS[k];
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
