import Image from "next/image";
import Link from "next/link";
import { SCHOOL } from "@m-scholar/shared";
import { ArrowRight } from "lucide-react";
import { pageHref } from "@/lib/paths";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">About us</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-brand">{SCHOOL.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{SCHOOL.motto}</p>

      <div className="mt-10 overflow-hidden rounded-3xl">
        <Image
          src={SCHOOL.photos.courtyard}
          alt="Pupils and staff gathered at M-Scholars' Academy"
          width={1200}
          height={700}
          className="h-64 w-full object-cover md:h-96"
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-brand">Our vision</h2>
          <p className="mt-3 leading-relaxed text-muted">{SCHOOL.vision}</p>
          <h2 className="mt-8 font-display text-2xl font-semibold text-brand">Our motto</h2>
          <p className="mt-3 leading-relaxed text-muted">
            We hold together book knowledge and character. Children learn to read, speak, and worship with respect
            for Allah, their teachers, and their community in Ogaminana.
          </p>
        </div>
        <div className="space-y-4">
          {SCHOOL.reasons.map((reason) => (
            <div key={reason} className="card-shadow rounded-2xl border border-border bg-white p-5">
              <p className="font-medium text-brand">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-brand px-8 py-10 text-center text-white">
        <p className="font-display text-xl font-semibold">Ready to join us?</p>
        <Link href={pageHref("/admissions")} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-gold hover:underline">
          View admissions <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
