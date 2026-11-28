"use client";

import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { playSound, setSoundEnabled, soundEnabled, subscribeSound, unlockSound, type SoundName } from "@/lib/sound";
import { cn } from "./ui";

const CLICKABLE = '[data-sound],a[href],button,summary,[role="button"],[role="tab"],[role="switch"],[role="radio"],[role="checkbox"],[role="menuitem"],[role="option"]';

/** Which sound a click on this element should make. Reads state before React flips it (capture phase). */
function soundFor(el: HTMLElement): SoundName | "nav-link" | null {
  const ds = el.dataset.sound;
  if (ds === "none") return null;
  const pressed = el.getAttribute("aria-pressed") ?? (el.getAttribute("role") === "switch" || el.getAttribute("role") === "checkbox" ? el.getAttribute("aria-checked") : null);
  if (ds === "task") return pressed === "true" ? "off" : "done";
  if (ds) return ds as SoundName;
  const role = el.getAttribute("role");
  if (role === "tab" || role === "radio" || role === "option" || el.hasAttribute("aria-selected")) return "select";
  // Buttons in a group (filter chips, segmented controls) behave like tabs; only a lone toggle gets on/off.
  if (pressed !== null) {
    const group = el.parentElement?.querySelectorAll(":scope > [aria-pressed], :scope > * > [aria-pressed]").length ?? 0;
    if (el.hasAttribute("aria-pressed") && group > 1) return "select";
    return pressed === "true" ? "off" : "on";
  }
  if (el.hasAttribute("aria-expanded")) return el.getAttribute("aria-expanded") === "true" ? "close" : "open";
  if (el instanceof HTMLAnchorElement) {
    if (el.target === "_blank" || el.hasAttribute("download")) return "tap";
    try {
      const url = new URL(el.href, location.href);
      if (url.origin !== location.origin) return "tap";
      if (url.pathname === location.pathname) return url.search === location.search ? "tap" : "select";
      return "nav-link";
    } catch {
      return "tap";
    }
  }
  return "tap";
}

/** Mounted once in the root layout: gives every button, link, tab and toggle on the site its sound. */
export function SoundEffects() {
  const pathname = usePathname();
  const navAt = useRef(0);
  const lastPath = useRef(pathname);
  // A link click already played its sound; the page change it causes must not play another, however slow it loads.
  const pending = useRef(false);

  useEffect(() => {
    const unlock = () => unlockSound();
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const el = t?.closest?.(CLICKABLE) as HTMLElement | null;
      if (!el || el instanceof HTMLInputElement) return; // checkboxes and radios sound on "change"
      if (el.matches(":disabled,[aria-disabled='true']")) return;
      const s = soundFor(el);
      if (!s) return;
      if (s === "nav-link") {
        // Modified clicks open a new tab; this page doesn't change.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return playSound("tap");
        navAt.current = Date.now();
        pending.current = true;
        return playSound("nav");
      }
      playSound(s);
    };
    const onChange = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLInputElement) {
        if (el.closest('[data-sound="none"]')) return;
        if (el.type === "checkbox") playSound(el.checked ? "on" : "off");
        else if (el.type === "radio") playSound("select");
      } else if (el instanceof HTMLSelectElement) playSound("select");
    };
    document.addEventListener("pointerdown", unlock, { capture: true, passive: true });
    document.addEventListener("keydown", unlock, { capture: true, passive: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("change", onChange, true);
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", onChange, true);
    };
  }, []);

  // Page changes that didn't come from a link click (redirects after a form, router.push, back/forward).
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const fromClick = pending.current && Date.now() - navAt.current < 15000;
    pending.current = false;
    if (!fromClick) playSound("nav");
  }, [pathname]);

  return null;
}

const serverOn = () => true;

export function useSoundOn() {
  return useSyncExternalStore(subscribeSound, soundEnabled, serverOn);
}

/** The Sounds on/off switch. */
export function SoundToggle({ className, variant = "row" }: { className?: string; variant?: "row" | "icon" }) {
  const on = useSoundOn();
  const flip = () => {
    setSoundEnabled(!on);
    if (!on) {
      unlockSound();
      playSound("on");
    }
  };
  if (variant === "icon") {
    return (
      <button
        type="button"
        data-sound="none"
        onClick={flip}
        aria-label={on ? "Turn sounds off" : "Turn sounds on"}
        title={on ? "Sounds on" : "Sounds off"}
        className={cn("inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-muted transition-colors hover:bg-bg-subtle hover:text-ink", className)}
      >
        {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} Sounds {on ? "on" : "off"}
      </button>
    );
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-sound="none"
      onClick={flip}
      className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium text-ink transition-colors hover:bg-bg-subtle", className)}
    >
      <span className="text-muted">{on ? <Volume2 className="size-[18px]" /> : <VolumeX className="size-[18px]" />}</span>
      <span className="flex-1">Sounds</span>
      <span aria-hidden className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200", on ? "bg-positive" : "bg-line-strong")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200", on ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
