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

(function () {
    const SEL = "canvas.surface";
    const FACTOR = 0.34; // ~1/3: a 3-line notch behaves like roughly 1 line
    let enabled = true;

    chrome.storage.local.get({ zoomFix: true }, (s) => { enabled = s.zoomFix; });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.zoomFix) enabled = changes.zoomFix.newValue;
    });

    window.addEventListener("wheel", function (e) {
        if (!enabled || !e.isTrusted) return;
        if (e.ctrlKey) return; // pinch / browser zoom: leave alone
        const c = document.querySelector(SEL);
        if (!c) return;
        // Only act when the wheel is over the canvas surface.
        if (e.target !== c && !c.contains(e.target)) {
            const r = c.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right ||
                e.clientY < r.top || e.clientY > r.bottom) return;
        }
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
