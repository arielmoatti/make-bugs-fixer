// Make.com: restore left-click drag to pan the canvas.
//
// Make's new canvas pans on RIGHT-drag (pointer button 2). This script
// re-enables the old left-drag-to-pan: when the user starts a left drag on
// EMPTY canvas, it fires a synthetic right-button pointerdown that REUSES the
// real pointerId (so Make's setPointerCapture succeeds); the real mouse moves
// then drive the native pan. Left-drag on a module is left untouched, so
// dragging/moving modules still works normally.
//
// Non-blocking by design: it never calls preventDefault/stopPropagation, it
// only ADDS one synthetic event. So it does not depend on running before
// Make's own listeners.

(function () {
    const SEL = "canvas.surface";
    const MOVE_THRESHOLD = 4; // px of movement before we treat a press as a drag

    let armed = null;   // {pointerId, x, y} set on left-press over empty canvas
    let panning = false;
    let enabled = true; // toggled via right-click on the extension icon

    chrome.storage.local.get({ panFix: true }, (s) => { enabled = s.panFix; });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.panFix) enabled = changes.panFix.newValue;
    });

    const getCanvas = () => document.querySelector(SEL);

    // Sample a small box under the cursor. "Empty" = almost no saturated pixels
    // (modules are large saturated blobs; the canvas background is flat grey).
    function isEmptyAt(canvas, clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        const sx = canvas.width / r.width;
        const sy = canvas.height / r.height;
        const cx = Math.round((clientX - r.left) * sx);
        const cy = Math.round((clientY - r.top) * sy);
        let ctx;
        try { ctx = canvas.getContext("2d"); } catch (e) { return false; }
        if (!ctx) return false;
        const R = 18;
        const x0 = Math.max(0, cx - R);
        const y0 = Math.max(0, cy - R);
        const w = Math.min(canvas.width - x0, R * 2);
        const h = Math.min(canvas.height - y0, R * 2);
        if (w <= 0 || h <= 0) return false;
        let data;
        try { data = ctx.getImageData(x0, y0, w, h).data; } catch (e) { return false; }
        let sat = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 10) continue;
            const mx = Math.max(data[i], data[i + 1], data[i + 2]);
            const mn = Math.min(data[i], data[i + 1], data[i + 2]);
            if (mx - mn > 70 && mx > 60) sat++;
        }
        return sat < 15;
    }

    function fireRightDown(canvas, x, y, pointerId) {
        canvas.dispatchEvent(new PointerEvent("pointerdown", {
            bubbles: true,
            cancelable: true,
            composed: true,
            clientX: x,
            clientY: y,
            button: 2,
            buttons: 2,
            pointerId: pointerId,
            pointerType: "mouse",
            isPrimary: true,
            view: window,
        }));
    }

    window.addEventListener("pointerdown", function (e) {
        if (!enabled || !e.isTrusted || e.button !== 0 || panning) return;
        const c = getCanvas();
        if (!c || e.target !== c) return;
        if (!isEmptyAt(c, e.clientX, e.clientY)) return; // over a module: leave alone
        armed = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
    }, true);

    window.addEventListener("pointermove", function (e) {
        if (!armed || panning || !e.isTrusted) return;
        if (Math.hypot(e.clientX - armed.x, e.clientY - armed.y) < MOVE_THRESHOLD) return;
        const c = getCanvas();
        if (!c) { armed = null; return; }
        panning = true;
        fireRightDown(c, armed.x, armed.y, armed.pointerId); // real moves drive the pan
        armed = null;
    }, true);

    function endPan() { armed = null; panning = false; }
    window.addEventListener("pointerup", endPan, true);
    window.addEventListener("pointercancel", endPan, true);

    console.log("Make Bugs Fixer: left-drag pan loaded");
})();
