"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/app/(protected)/actions";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/dashboard", label: "Projects" },
  { href: "/settings/profile", label: "Profile" },
] as const;

export function WorkspaceNavigation({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="workspace-navigation">
      <BrandLogo href="/dashboard" light />
      <div className="workspace-navigation__identity">
        <span>Personal studio</span>
        <small>{email}</small>
      </div>
      <nav aria-label="Workspace navigation" className="workspace-navigation__links">
        {links.map((link) => {
          const active = pathname === link.href || (link.href === "/dashboard" && pathname.startsWith("/projects"));
          return <Link aria-current={active ? "page" : undefined} data-active={active} href={link.href} key={link.href}>{link.label}</Link>;
        })}
        <form action={logoutAction}><Button type="submit" variant="quiet">Sign out</Button></form>
      </nav>
      <button
        aria-controls="workspace-mobile-navigation"
        aria-expanded={open}
        aria-label={open ? "Close workspace navigation" : "Open workspace navigation"}
        className="workspace-navigation__menu"
        onClick={() => setOpen((current) => !current)}
        type="button"
      ><span /><span /></button>
      <nav aria-label="Mobile workspace navigation" className="workspace-navigation__mobile" data-open={open} id="workspace-mobile-navigation">
        {links.map((link) => <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <form action={logoutAction}><Button type="submit" variant="quiet">Sign out</Button></form>
      </nav>
    </header>
  );
}
