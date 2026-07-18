export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: Readonly<{
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}>) {
  const descriptionId = `${htmlFor}-description`;

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-forest" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-clay" id={descriptionId}>{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-sm text-ink/70" id={descriptionId}>{hint}</p> : null}
    </div>
  );
}
