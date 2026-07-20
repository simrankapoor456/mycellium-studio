"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PROJECT_START_HREF } from "@/lib/marketing/links";

const navigation = [
  ["Product", "#product"],
  ["How it works", "#how-it-works"],
  ["Philosophy", "#philosophy"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-28% 0px -60%", threshold: [0.05, 0.2, 0.5] },
    );

    for (const [, href] of navigation) {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function closeOnHashChange() {
      setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("hashchange", closeOnHashChange);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("hashchange", closeOnHashChange);
    };
  }, []);

  return (
    <header className="public-header">
      <Container>
        <div className="public-header__capsule">
          <BrandLogo light />
          <nav className="public-header__desktop-nav" aria-label="Primary navigation">
            {navigation.map(([label, href]) => (
              <Link aria-current={activeHref === href ? "location" : undefined} data-active={activeHref === href} href={href} key={href} onClick={() => setActiveHref(href)}>{label}</Link>
            ))}
          </nav>
          <div className="public-header__actions">
            <ButtonLink href="/login" variant="quiet">Log in</ButtonLink>
            <ButtonLink className="public-header__start" href={PROJECT_START_HREF}>Start your project</ButtonLink>
            <button
              aria-controls="public-mobile-navigation"
              aria-expanded={open}
              aria-label={open ? "Close navigation" : "Open navigation"}
              className="public-header__menu-button"
              onClick={() => setOpen((current) => !current)}
              type="button"
            >
              <span /><span />
            </button>
          </div>
        </div>
        <nav aria-label="Mobile navigation" className="public-header__mobile-nav" data-open={open} id="public-mobile-navigation">
          {navigation.map(([label, href]) => (
            <Link aria-current={activeHref === href ? "location" : undefined} data-active={activeHref === href} href={href} key={href} onClick={() => { setActiveHref(href); setOpen(false); }}>{label}</Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
