import { SCHOOL } from "@m-scholar/shared";
import { MapPin, Phone, Mail } from "lucide-react";
import { telHref, mailtoHref, whatsappHref } from "@/lib/paths";

export default function ContactPage() {
  const enquire = `Assalamu alaikum. I would like to speak with ${SCHOOL.name}.`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-brand">Contact us</h1>
      <p className="mt-2 text-lg text-muted">Visit, call, or send a WhatsApp message.</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-brand">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand">Address</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(SCHOOL.address)}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-brand hover:underline"
              >
                {SCHOOL.address}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-brand">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand">Calls & WhatsApp</p>
              <a href={telHref(SCHOOL.phone)} className="text-muted hover:text-brand hover:underline">
                {SCHOOL.phone}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-brand">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand">Email</p>
              <a href={mailtoHref(SCHOOL.email)} className="text-muted hover:text-brand hover:underline">
                {SCHOOL.email}
              </a>
            </div>
          </div>
          <a
            href={whatsappHref(SCHOOL.whatsapp, enquire)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto"
          >
            Message on WhatsApp
          </a>
        </div>

        <form className="card-shadow rounded-2xl border border-border bg-white p-8" action={mailtoHref(SCHOOL.email)} method="get">
          <h2 className="font-display text-xl font-semibold text-brand">Send an email</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-ink">
                Your name
              </label>
              <input id="contact-name" name="name" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input id="contact-email" type="email" name="email" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label htmlFor="contact-body" className="mb-1 block text-sm font-medium text-ink">
                Message
              </label>
              <textarea id="contact-body" name="body" rows={4} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <button type="submit" className="w-full min-h-11 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark">
              Send message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
