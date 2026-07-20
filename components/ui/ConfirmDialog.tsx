"use client";

import { useId, useRef } from "react";

import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  title,
  description,
  triggerLabel,
  confirmLabel,
  formAction,
  hiddenFields,
}: Readonly<{
  title: string;
  description: string;
  triggerLabel: string;
  confirmLabel: string;
  formAction: (formData: FormData) => void;
  hiddenFields: ReadonlyArray<{ name: string; value: string }>;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button className="min-h-11 text-sm font-bold text-clay underline-offset-4 hover:underline" onClick={() => dialogRef.current?.showModal()} type="button">
        {triggerLabel}
      </button>
      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="dialog-backdrop ui-dialog" ref={dialogRef}>
        <div className="ui-dialog__content">
          <h2 className="display-type text-2xl text-forest" id={titleId}>{title}</h2>
          <p className="mt-3 leading-7 text-ink/70" id={descriptionId}>{description}</p>
          <form action={formAction} className="mt-7 flex flex-wrap justify-end gap-3" onSubmit={() => dialogRef.current?.close()}>
            {hiddenFields.map((field) => <input key={field.name} name={field.name} type="hidden" value={field.value} />)}
            <Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">Keep project</Button>
            <Button type="submit" variant="danger">{confirmLabel}</Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
