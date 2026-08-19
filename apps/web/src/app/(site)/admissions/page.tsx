import Image from "next/image";
import Link from "next/link";
import { SCHOOL } from "@m-scholar/shared";
import { CheckCircle } from "lucide-react";
import { pageHref, telHref, mailtoHref, whatsappHref } from "@/lib/paths";

export default function AdmissionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Limited spaces available</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-brand">Admissions</h1>
      <p className="mt-2 text-lg text-muted">{SCHOOL.session} academic session — now open</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="card-shadow rounded-2xl border border-border bg-white p-8">
            <h2 className="font-display text-xl font-semibold text-brand">Now admitting</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SCHOOL.levels.map((level) => (
                <div key={level.name} className="rounded-xl bg-cream px-4 py-3">
                  <p className="font-semibold text-brand">{level.name}</p>
                  <p className="mt-1 text-sm text-muted">{level.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card-shadow rounded-2xl border border-border bg-white p-8">
            <h2 className="font-display text-xl font-semibold text-brand">Why parents choose us</h2>
            <ul className="mt-4 space-y-3">
              {SCHOOL.reasons.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="card-shadow rounded-2xl border border-border bg-white p-8">
            <h2 className="font-display text-xl font-semibold text-brand">What to bring</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Completed enquiry or visit to the school",
                "Child's birth certificate or age declaration",
                "Previous school report (if transferring)",
                "Two recent passport photographs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <Image
            src={SCHOOL.photos.flyer}
            alt={`${SCHOOL.name} admission flyer for ${SCHOOL.session}`}
            width={720}
            height={960}
            className="w-full rounded-2xl border border-border object-cover"
          />
          <div className="card-shadow rounded-2xl border border-gold/40 bg-cream p-6">
            <h3 className="font-display font-semibold text-brand">Register today</h3>
            <p className="mt-2 text-sm text-muted">Call or WhatsApp the school office to begin.</p>
            <p className="mt-4 text-sm">
              <strong>Calls & WhatsApp:</strong>{" "}
              <a href={telHref(SCHOOL.phone)} className="text-brand hover:underline">
                {SCHOOL.phone}
              </a>
            </p>
            <p className="text-sm">
              <strong>Email:</strong>{" "}
              <a href={mailtoHref(SCHOOL.email)} className="text-brand hover:underline">
                {SCHOOL.email}
              </a>
            </p>
            <a
              href={whatsappHref(SCHOOL.whatsapp, `Assalamu alaikum. I want to register my child at ${SCHOOL.name} for ${SCHOOL.session}.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block min-h-11 rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
            >
              WhatsApp admissions
            </a>
            <Link href={pageHref("/contact")} className="mt-2 block text-center text-sm font-semibold text-brand hover:underline">
              Other contact options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
