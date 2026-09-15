"use strict";
/* ==========================================================================
   SahakarConnect — landing page interactivity (vanilla TS, no framework)
   Compile with: tsc app.ts --target ES2019 --outFile app.js
   ========================================================================== */
const FONT_SCALES = { sm: "0.9375", md: "1", lg: "1.125" };
function initThemeSwitch() {
    const buttons = document.querySelectorAll("[data-theme-choice]");
    const stored = localStorage.getItem("ux4g-theme") || "light";
    applyTheme(stored);
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const theme = btn.dataset.themeChoice;
            applyTheme(theme);
            localStorage.setItem("ux4g-theme", theme);
        });
    });
    function applyTheme(theme) {
        if (theme === "light") {
            document.documentElement.removeAttribute("data-theme");
        }
        else {
            document.documentElement.setAttribute("data-theme", theme);
        }
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoice === theme)));
    }
}
function initFontSwitch() {
    const buttons = document.querySelectorAll("[data-font-choice]");
    const stored = localStorage.getItem("ux4g-font-scale") || "md";
    applyScale(stored);
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const scale = btn.dataset.fontChoice;
            applyScale(scale);
            localStorage.setItem("ux4g-font-scale", scale);
        });
    });
    function applyScale(scale) {
        document.documentElement.style.setProperty("--ux4g-font-scale", FONT_SCALES[scale]);
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fontChoice === scale)));
    }
}
/** Statutory 88 / 8 / 4 split, with the MSCS Act 2023 rounding invariant:
 *  any paisa left over from rounding is credited to the worker share. */
function computeSplit(amount) {
    const welfare = Math.round(amount * 0.08 * 100) / 100;
    const platform = Math.round(amount * 0.04 * 100) / 100;
    const worker = Math.round((amount - welfare - platform) * 100) / 100;
    return { worker, welfare, platform };
}
function formatINR(value) {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
function initCalculator() {
    const input = document.querySelector("#calc-amount");
    const chips = document.querySelectorAll("[data-quick-amount]");
    const workerOut = document.querySelector("#calc-worker");
    const welfareOut = document.querySelector("#calc-welfare");
    const platformOut = document.querySelector("#calc-platform");
    if (!input || !workerOut || !welfareOut || !platformOut)
        return;
    function render() {
        const amount = Math.max(0, Number(input.value) || 0);
        const { worker, welfare, platform } = computeSplit(amount);
        workerOut.textContent = `₹${formatINR(worker)}`;
        welfareOut.textContent = `₹${formatINR(welfare)}`;
        platformOut.textContent = `₹${formatINR(platform)}`;
        chips.forEach((c) => c.setAttribute("aria-pressed", String(Number(c.dataset.quickAmount) === amount)));
    }
    input.addEventListener("input", render);
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            input.value = chip.dataset.quickAmount || "0";
            render();
        });
    });
    render();
}
/** Legal / statutory policy modal with tabbed sections. */
function initLegalModal() {
    const openers = document.querySelectorAll("[data-open-legal]");
    const overlay = document.querySelector("#legal-modal");
    if (!overlay)
        return;
    const closeBtn = overlay.querySelector(".modal-close");
    const tabs = overlay.querySelectorAll(".modal-tab");
    const panels = overlay.querySelectorAll(".modal-panel");
    let lastFocused = null;
    function open(panelId) {
        lastFocused = document.activeElement;
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        if (panelId)
            selectTab(panelId);
        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.focus();
        document.body.style.overflow = "hidden";
    }
    function close() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        lastFocused === null || lastFocused === void 0 ? void 0 : lastFocused.focus();
    }
    function selectTab(panelId) {
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.panel === panelId)));
        panels.forEach((p) => p.classList.toggle("is-active", p.id === panelId));
    }
    openers.forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            open(el.dataset.openLegal || undefined);
        });
    });
    closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay)
            close();
    });
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => selectTab(tab.dataset.panel));
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open"))
            close();
    });
}
function initNav() {
    const toggle = document.querySelector("#nav-toggle");
    const nav = document.querySelector("#nav-row");
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener("click", () => {
        const isOpen = nav === null || nav === void 0 ? void 0 : nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(!!isOpen));
    });
}
document.addEventListener("DOMContentLoaded", () => {
    initThemeSwitch();
    initFontSwitch();
    initCalculator();
    initLegalModal();
    initNav();
});
