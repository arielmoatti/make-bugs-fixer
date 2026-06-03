// Make.com: finer zoom steps on mouse wheel.
//
// Make zooms the canvas proportionally to the wheel's deltaY. When the OS is
// set to scroll several lines per wheel notch (Windows default is 3), each
// notch jumps the zoom too far. This intercepts the real wheel event over the
// canvas, cancels it, and re-dispatches a synthetic wheel with the delta scaled
// down — so each notch zooms a smaller, finer step.
//
// Loop-safe: only TRUSTED wheel events are intercepted; the synthetic one we
// emit (isTrusted=false) is ignored, so it reaches Make untouched.
//
// OFF by default since v2.7: Make restored the native wheel-zoom sensitivity to
// its pre-canvas-update behaviour, so scaling the delta down here now OVER-damps
// it (each notch becomes ~1/3 of a native step, i.e. sluggish). Left in place,
// toggleable from the icon menu, for anyone who still wants finer steps.

(function () {
    const SEL = "canvas.surface";
    const FACTOR = 0.34; // ~1/3: a 3-line notch behaves like roughly 1 line
    let enabled = false; // OFF by default; toggled via right-click on the extension icon

    chrome.storage.local.get({ zoomFix: false }, (s) => { enabled = s.zoomFix; });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.zoomFix) enabled = changes.zoomFix.newValue;
    });

    window.addEventListener("wheel", function (e) {
        if (!enabled || !e.isTrusted) return;
        if (e.ctrlKey) return; // pinch / browser zoom: leave alone
        const c = document.querySelector(SEL);
        if (!c) return;
        // Only act when the wheel TARGET is the canvas surface itself, exactly
        // like the left-drag pan. Overlay panels (a module's properties window,
        // sidebars) are separate DOM elements layered on top of the canvas, so
        // their wheel events target THEM, not the canvas - we skip those and let
        // the panel scroll natively. Checking the cursor's rect is not enough: a
        // panel can cover a spot that still falls inside the canvas's bounds.
        if (e.target !== c) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        c.dispatchEvent(new WheelEvent("wheel", {
            bubbles: true,
            cancelable: true,
            composed: true,
            clientX: e.clientX,
            clientY: e.clientY,
            deltaX: e.deltaX * FACTOR,
            deltaY: e.deltaY * FACTOR,
            deltaZ: e.deltaZ,
            deltaMode: e.deltaMode,
            view: window,
        }));
    }, { capture: true, passive: false });

    console.log("Make Bugs Fixer: finer zoom loaded");
})();
