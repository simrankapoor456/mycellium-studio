export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  labelAction,
}: Readonly<{
  label: React.ReactNode;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
  labelAction?: React.ReactNode;
}>) {
  const descriptionId = `${htmlFor}-description`;

  return (
    <div className={className}>
      <div className="form-field__label"><label htmlFor={htmlFor}>{label}</label>{labelAction}</div>
      {children}
      {error ? <p className="form-field__message form-field__message--error" id={descriptionId}>{error}</p> : null}
      {!error && hint ? <p className="form-field__message" id={descriptionId}>{hint}</p> : null}
    </div>
  );
}
