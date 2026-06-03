// Hebrew font fix for Make.com / Boost.space.
// Can be toggled on/off via right-click on the extension icon.
// Note: turning it OFF stops further restyling immediately; elements already
// restyled revert fully only after a page refresh.

let observer = null;

// Append a Hebrew-capable fallback to the element's EXISTING font stack instead
// of replacing it. font-family applies per element, but the browser resolves it
// per glyph: keeping the site's own font first (e.g. Inter on Make) means Latin
// and digits stay in that font, and only the Hebrew glyphs - which the Latin-only
// webfont can't draw - fall through to Segoe UI. Replacing the stack outright
// (the old behaviour) forced the Latin parts of mixed strings onto Segoe UI too,
// so a label with Hebrew looked different from a neighbouring English-only label.
// The /segoe ui/ guard keeps it idempotent under the MutationObserver (an element
// already patched - or inheriting a patched stack - is skipped, no re-appending).
function fixHebrewFonts() {
    document.querySelectorAll("*").forEach((el) => {
        if (el.innerText && /[֐-׿]/.test(el.innerText)) {
            const cur = el.style.fontFamily || getComputedStyle(el).fontFamily;
            if (!/segoe ui/i.test(cur)) {
                el.style.setProperty(
                    "font-family",
                    cur + ", 'Segoe UI', Arial, sans-serif",
                    "important",
                );
            }
        }
    });
}

function start() {
    if (observer) return;
    fixHebrewFonts();
    observer = new MutationObserver(fixHebrewFonts);
    observer.observe(document.body, { childList: true, subtree: true });
}

function stop() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

chrome.storage.local.get({ hebrewFix: true }, (s) => {
    if (s.hebrewFix) start();
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.hebrewFix) {
        if (changes.hebrewFix.newValue) start();
        else stop();
    }
});

console.log("Make Bugs Fixer: Hebrew font fix loaded");
