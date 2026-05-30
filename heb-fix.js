// Hebrew font fix for Make.com / Boost.space.
// Can be toggled on/off via right-click on the extension icon.
// Note: turning it OFF stops further restyling immediately; elements already
// restyled revert fully only after a page refresh.

let observer = null;

function fixHebrewFonts() {
    document.querySelectorAll("*").forEach((el) => {
        if (el.innerText && /[֐-׿]/.test(el.innerText)) {
            el.style.setProperty(
                "font-family",
                "Segoe UI, Arial, sans-serif",
                "important",
            );
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
