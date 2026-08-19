import Link from "next/link";
import { SCHOOL, PUBLIC_NAV } from "@m-scholar/shared";
import { Mail, Phone, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { pageHref, telHref, mailtoHref, whatsappHref } from "@/lib/paths";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand text-white/80">
      <div className="gold-rule" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div className="md:col-span-2">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo size={56} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-white sm:text-xl">{SCHOOL.name}</p>
              <p className="text-sm text-gold">{SCHOOL.motto}</p>
            </div>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">{SCHOOL.vision}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(SCHOOL.address)}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                {SCHOOL.address}
              </a>
            </li>
            <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={telHref(SCHOOL.phone)} className="hover:text-white">
                {SCHOOL.phone}
              </a>
              <span className="text-white/40">·</span>
              <a href={whatsappHref(SCHOOL.whatsapp)} className="hover:text-white" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={mailtoHref(SCHOOL.email)} className="hover:text-white">
                {SCHOOL.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Quick links</p>
          <ul className="mt-3 space-y-2 text-sm">
            {PUBLIC_NAV.map(({ label, href }) => (
              <li key={href}>
                <Link href={pageHref(href)} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login/" className="hover:text-white">
                School Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-xs text-white/45 md:px-6">
          <span>
            © {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.
          </span>
          <Link href="/login/admin/" title="Admin portal" aria-label="Admin portal sign in" className="inline-flex items-center text-white/35 transition hover:text-white/70">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
          <Link href="/login/finance/" title="Finance officer portal" aria-label="Finance officer portal sign in" className="inline-flex items-center text-white/35 transition hover:text-white/70">
            <Wallet className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
