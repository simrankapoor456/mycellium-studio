import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: Readonly<{
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}>) {
  return (
    <section className="border border-dashed border-line-strong bg-surface/65 px-6 py-16 text-center">
      <Image alt="" className="mx-auto" height={64} src="/brand/mycellium-mark.svg" width={64} />
      <h2 className="display-type mt-6 text-3xl text-forest">{title}</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-ink/65">{description}</p>
      <ButtonLink className="mt-7" href={actionHref}>{actionLabel}</ButtonLink>
    </section>
  );
}
