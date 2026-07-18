import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCtaSection() {
  return (
    <section className="bg-forest py-20 text-paper sm:py-28">
      <Container className="grid items-center gap-10 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="display-type balanced-text max-w-4xl text-4xl leading-[1.05] sm:text-6xl">Give the next product decision a stronger foundation.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-paper/70">Create a private project workspace now, then continue into guided discovery when Phase 3B arrives.</p>
          <ButtonLink className="mt-8 bg-paper text-forest hover:bg-sage" href="/signup">Start your project</ButtonLink>
        </div>
        <Image alt="" height={128} src="/brand/mycellium-mark-light.svg" width={128} />
      </Container>
    </section>
  );
}
