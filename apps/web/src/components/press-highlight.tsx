"use client";

import { useEffect } from "react";

const SELECTOR = "a, button, [role='button'], input[type='submit'], input[type='button'], summary, label.pressable";

export function PressHighlight() {
  useEffect(() => {
    const clear = () => {
      document.querySelectorAll(".is-pressed").forEach((node) => node.classList.remove("is-pressed"));
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest(SELECTOR);
      if (!el || el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      el.classList.add("is-pressed");
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", clear);
    document.addEventListener("pointercancel", clear);
    window.addEventListener("blur", clear);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", clear);
      document.removeEventListener("pointercancel", clear);
      window.removeEventListener("blur", clear);
    };
  }, []);
  return null;
}
