import type { FieldErrors } from "@/lib/actions/action-state";

export function focusFirstInvalidField(form: HTMLFormElement, fieldErrors: FieldErrors) {
  const invalidField = Array.from(form.elements).find((element) => {
    return element instanceof HTMLElement
      && "name" in element
      && typeof element.name === "string"
      && Boolean(fieldErrors[element.name]?.length);
  });

  if (!(invalidField instanceof HTMLElement)) return;

  invalidField.setAttribute("aria-invalid", "true");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  invalidField.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  window.requestAnimationFrame(() => invalidField.focus({ preventScroll: true }));
}

export function hasFieldErrors(fieldErrors: FieldErrors): boolean {
  return Object.values(fieldErrors).some((messages) => messages.length > 0);
}
