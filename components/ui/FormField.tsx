export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  labelAction,
  requirement,
}: Readonly<{
  label: React.ReactNode;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
  labelAction?: React.ReactNode;
  requirement?: "required" | "optional" | undefined;
}>) {
  const descriptionId = `${htmlFor}-description`;

  return (
    <div className={className}>
      <div className="form-field__label">
        <label htmlFor={htmlFor}>{label}</label>
        {requirement === "required" ? <RequiredMarker /> : null}
        {requirement === "optional" ? <OptionalHelper /> : null}
        {labelAction}
      </div>
      {children}
      {error ? <p className="form-field__message form-field__message--error" id={descriptionId}>{error}</p> : null}
      {!error && hint ? <p className="form-field__message" id={descriptionId}>{hint}</p> : null}
    </div>
  );
}

export function RequiredMarker() {
  return <span aria-hidden="true" className="form-field__requirement form-field__requirement--required">Required</span>;
}

export function OptionalHelper() {
  return <span className="form-field__requirement">Optional</span>;
}
