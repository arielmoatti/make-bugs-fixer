// Adds three checkbox toggles to the right-click menu of the extension icon:
//   - Hebrew font fix
//   - Left-drag pan (canvas)
//   - Finer wheel zoom (canvas)
// State is stored in chrome.storage.local and read by the content scripts.

// panFix and zoomFix both default to OFF, because Make has since fixed both
// natively:
//   - pan:  a "Canvas panning: Left-click" setting (View > Preferences > Input
//           device settings). With it on, our synthetic right-button pointerdown
//           triggers Make's multi-select (lasso) on every left-drag.
//   - zoom: Make restored the pre-canvas-update wheel-zoom sensitivity, so our
//           delta-scaling now over-dampens it (each notch becomes ~1/3 the step,
//           i.e. sluggish). Confirmed back to normal across browsers/accounts.
// Both can still be re-enabled manually from the icon's right-click menu.
const DEFAULTS = { hebrewFix: true, panFix: false, zoomFix: false };

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
const ZOOM_MIGRATION_FLAG = "zoomForcedOff_v2_7";

chrome.runtime.onInstalled.addListener(async (details) => {
    const cur = await chrome.storage.local.get([
        ...Object.keys(DEFAULTS), PAN_MIGRATION_FLAG, ZOOM_MIGRATION_FLAG,
    ]);
    const init = {};
    for (const k of Object.keys(DEFAULTS)) {
        if (cur[k] === undefined) init[k] = DEFAULTS[k];
    }
    // One-time migrations for existing installs. Each is guarded by its own flag
    // so it runs a single time — users who deliberately re-enable a fix afterwards
    // keep their choice.
    //   v2.6: Make shipped a native canvas-pan toggle, so force pan-fix off once
    //         (otherwise it lasso-conflicts with the native left-pan).
    if (details.reason === "update" && !cur[PAN_MIGRATION_FLAG]) {
        init.panFix = false;
        init[PAN_MIGRATION_FLAG] = true;
    }
    //   v2.7: Make restored the native wheel-zoom sensitivity, so force zoom-fix
    //         off once (otherwise our delta-scaling makes zooming sluggish).
    if (details.reason === "update" && !cur[ZOOM_MIGRATION_FLAG]) {
        init.zoomFix = false;
        init[ZOOM_MIGRATION_FLAG] = true;
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
