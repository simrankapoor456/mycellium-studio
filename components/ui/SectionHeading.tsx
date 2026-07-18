import { cn } from "@/lib/class-names";

export function SectionHeading({
  title,
  description,
  eyebrow,
  align = "left",
  className,
}: Readonly<{
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
}>) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="mb-4 text-sm font-bold text-moss">{eyebrow}</p> : null}
      <h2 className="display-type balanced-text text-4xl leading-[1.05] text-forest sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? <p className="mt-5 max-w-[65ch] text-lg leading-8 text-ink/70">{description}</p> : null}
    </header>
  );
}
