import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/class-names";

type FieldPresentation = Readonly<{
  error?: string | undefined;
  hint?: string | undefined;
  id: string;
  label: React.ReactNode;
  labelAction?: React.ReactNode;
  requirement?: "required" | "optional" | undefined;
  wrapperClassName?: string | undefined;
}>;

export function TextField({ error, hint, id, label, labelAction, requirement, wrapperClassName, className, ...props }: FieldPresentation & React.InputHTMLAttributes<HTMLInputElement>) {
  const descriptionId = `${id}-description`;
  return (
    <FormField className={wrapperClassName} error={error} hint={hint} htmlFor={id} label={label} labelAction={labelAction} requirement={requirement}>
      <input
        {...props}
        aria-describedby={error || hint ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={cn("form-control mt-2", className)}
        id={id}
        required={requirement === "required" || props.required}
      />
    </FormField>
  );
}

export function TextareaField({ error, hint, id, label, labelAction, requirement, wrapperClassName, className, ...props }: FieldPresentation & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const descriptionId = `${id}-description`;
  return (
    <FormField className={wrapperClassName} error={error} hint={hint} htmlFor={id} label={label} labelAction={labelAction} requirement={requirement}>
      <textarea
        {...props}
        aria-describedby={error || hint ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={cn("form-control mt-2", className)}
        id={id}
        required={requirement === "required" || props.required}
      />
    </FormField>
  );
}

export function SelectField({ children, error, hint, id, label, labelAction, requirement, wrapperClassName, className, ...props }: FieldPresentation & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const descriptionId = `${id}-description`;
  return (
    <FormField className={wrapperClassName} error={error} hint={hint} htmlFor={id} label={label} labelAction={labelAction} requirement={requirement}>
      <select
        {...props}
        aria-describedby={error || hint ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={cn("form-control mt-2", className)}
        id={id}
        required={requirement === "required" || props.required}
      >{children}</select>
    </FormField>
  );
}
