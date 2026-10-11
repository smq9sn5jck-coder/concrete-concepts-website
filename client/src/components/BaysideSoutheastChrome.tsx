import React from "react";
import { Link } from "wouter";

const logo = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png";

/** Narrow candidate chrome: factual identity and working routes, no inherited claim widgets. */
export function BaysideSoutheastHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 bg-brand-charcoal text-white">
      <div className="container flex min-h-24 flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" aria-label="Concrete Concepts Group home"><img src={logo} alt="Concrete Concepts Group" width={104} height={64} className="h-12 w-auto" /></Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <a href="/#services" className="inline-flex min-h-11 items-center px-2">Services</a>
          <Link href="/areas" className="inline-flex min-h-11 items-center px-2">Areas</Link>
          <Link href="/get-quote" className="inline-flex min-h-11 items-center rounded-lg bg-brand-gold px-4 text-brand-charcoal">Detailed quote</Link>
        </nav>
      </div>
    </header>
  );
}

export function BaysideSoutheastFooter() {
  return (
    <footer className="bg-brand-charcoal py-10 text-white">
      <div className="container flex flex-col justify-between gap-7 sm:flex-row">
        <div><p className="font-bold">Concrete Concepts Group Pty Ltd</p><p className="mt-2 text-sm text-white/70">Concrete projects in Brisbane and selected South East Queensland areas, subject to site review.</p></div>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 text-sm">
          <a href="/#services" className="inline-flex min-h-11 items-center">Services</a>
          <Link href="/get-quote" className="inline-flex min-h-11 items-center">Detailed quote</Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center">Privacy</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
