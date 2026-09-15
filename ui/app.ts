/* ==========================================================================
   SahakarConnect — landing page interactivity (vanilla TS, no framework)
   Compile with: tsc app.ts --target ES2019 --outFile app.js
   ========================================================================== */

type ThemeName = "light" | "dark" | "contrast";
type FontScale = "sm" | "md" | "lg";

const FONT_SCALES: Record<FontScale, string> = { sm: "0.9375", md: "1", lg: "1.125" };

function initThemeSwitch(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]");
  const stored = (localStorage.getItem("ux4g-theme") as ThemeName) || "light";
  applyTheme(stored);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.themeChoice as ThemeName;
      applyTheme(theme);
      localStorage.setItem("ux4g-theme", theme);
    });
  });

  function applyTheme(theme: ThemeName): void {
    if (theme === "light") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoice === theme)));
  }
}

function initFontSwitch(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-font-choice]");
  const stored = (localStorage.getItem("ux4g-font-scale") as FontScale) || "md";
  applyScale(stored);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const scale = btn.dataset.fontChoice as FontScale;
      applyScale(scale);
      localStorage.setItem("ux4g-font-scale", scale);
    });
  });

  function applyScale(scale: FontScale): void {
    document.documentElement.style.setProperty("--ux4g-font-scale", FONT_SCALES[scale]);
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fontChoice === scale)));
  }
}

/** Statutory 88 / 8 / 4 split, with the MSCS Act 2023 rounding invariant:
 *  any paisa left over from rounding is credited to the worker share. */
function computeSplit(amount: number): { worker: number; welfare: number; platform: number } {
  const welfare = Math.round(amount * 0.08 * 100) / 100;
  const platform = Math.round(amount * 0.04 * 100) / 100;
  const worker = Math.round((amount - welfare - platform) * 100) / 100;
  return { worker, welfare, platform };
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function initCalculator(): void {
  const input = document.querySelector<HTMLInputElement>("#calc-amount");
  const chips = document.querySelectorAll<HTMLButtonElement>("[data-quick-amount]");
  const workerOut = document.querySelector<HTMLElement>("#calc-worker");
  const welfareOut = document.querySelector<HTMLElement>("#calc-welfare");
  const platformOut = document.querySelector<HTMLElement>("#calc-platform");
  if (!input || !workerOut || !welfareOut || !platformOut) return;

  function render(): void {
    const amount = Math.max(0, Number(input!.value) || 0);
    const { worker, welfare, platform } = computeSplit(amount);
    workerOut!.textContent = `₹${formatINR(worker)}`;
    welfareOut!.textContent = `₹${formatINR(welfare)}`;
    platformOut!.textContent = `₹${formatINR(platform)}`;
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
function initLegalModal(): void {
  const openers = document.querySelectorAll<HTMLElement>("[data-open-legal]");
  const overlay = document.querySelector<HTMLElement>("#legal-modal");
  if (!overlay) return;

  const closeBtn = overlay.querySelector<HTMLElement>(".modal-close");
  const tabs = overlay.querySelectorAll<HTMLButtonElement>(".modal-tab");
  const panels = overlay.querySelectorAll<HTMLElement>(".modal-panel");
  let lastFocused: HTMLElement | null = null;

  function open(panelId?: string): void {
    lastFocused = document.activeElement as HTMLElement;
    overlay!.classList.add("is-open");
    overlay!.setAttribute("aria-hidden", "false");
    if (panelId) selectTab(panelId);
    closeBtn?.focus();
    document.body.style.overflow = "hidden";
  }

  function close(): void {
    overlay!.classList.remove("is-open");
    overlay!.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocused?.focus();
  }

  function selectTab(panelId: string): void {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.panel === panelId)));
    panels.forEach((p) => p.classList.toggle("is-active", p.id === panelId));
  }

  openers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(el.dataset.openLegal || undefined);
    });
  });

  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.panel!));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
}

function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>("#nav-toggle");
  const nav = document.querySelector<HTMLElement>("#nav-row");
  toggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
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
