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
      <div className="form-field__label"><label className="block text-sm font-bold text-forest" htmlFor={htmlFor}>{label}</label>{labelAction}</div>
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-clay" id={descriptionId}>{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-sm text-ink/70" id={descriptionId}>{hint}</p> : null}
    </div>
  );
}
