import Link from "next/link";
import { SCHOOL } from "@m-scholar/shared";
import { pageHref } from "@/lib/paths";

export default function AcademicsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-brand">Academics</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">
        Integrated Islamic and Western education from Kindergarten through Primary 5.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {SCHOOL.levels.map((level) => (
          <div key={level.name} className="card-shadow rounded-2xl border border-border bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-brand">{level.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{level.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { title: "Tahfeez & Islamic Studies", text: "Qur'an, worship, and character that match our vision of Allah's consciousness." },
          { title: "Jolly Phonics & Montessori", text: "Early reading and hands-on learning so every child can start with confidence." },
          { title: "Western core subjects", text: "Literacy, numeracy, and the foundations needed for later schooling." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-cream p-6">
            <h3 className="font-display font-semibold text-brand">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="card-shadow mt-12 rounded-2xl border border-border bg-white p-8">
        <h2 className="font-display text-xl font-semibold text-brand">Assessment and the school portal</h2>
        <p className="mt-2 text-muted">
          Continuous assessment and end-of-term work are shared with families. Parents and pupils can follow
          attendance, notes, and results through the{" "}
          <Link href={pageHref("/login")} className="font-semibold text-brand hover:underline">
            school portal
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
