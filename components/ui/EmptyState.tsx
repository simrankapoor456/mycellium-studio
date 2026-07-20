import { BrandMark } from "@/components/brand/BrandMark";
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
    <section className="empty-state">
      <BrandMark className="empty-state__mark" />
      <h2 className="display-type mt-6 text-3xl text-forest">{title}</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-ink/65">{description}</p>
      <ButtonLink className="empty-state__action" href={actionHref}>{actionLabel}</ButtonLink>
    </section>
  );
}
