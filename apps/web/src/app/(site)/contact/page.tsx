import { SCHOOL } from "@m-scholar/shared";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { telHref, mailtoHref } from "@/lib/paths";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold text-slate-900">Contact Us</h1>
      <p className="mt-2 text-lg text-slate-500">We&apos;d love to hear from you</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Address</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(SCHOOL.address)}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-blue-700 hover:underline"
              >
                {SCHOOL.address}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Phone</p>
              <a href={telHref(SCHOOL.phone)} className="text-slate-600 hover:text-blue-700 hover:underline">
                {SCHOOL.phone}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <a href={mailtoHref(SCHOOL.email)} className="text-slate-600 hover:text-blue-700 hover:underline">
                {SCHOOL.email}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Office Hours</p>
              <p className="text-slate-600">Mon–Fri: 7:30 AM – 4:00 PM</p>
            </div>
          </div>
        </div>

        <form
          className="card-shadow rounded-2xl border border-slate-100 bg-white p-8"
          action={mailtoHref(SCHOOL.email)}
          method="get"
        >
          <h2 className="font-display text-xl font-bold text-slate-900">Send a Message</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Your name</label>
              <input name="name" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" name="email" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
              <textarea name="body" rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
